import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions');
        res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching roles",
            error: error.message
        });
    }
};

// Get single role
export const getRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions');
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching role",
            error: error.message
        });
    }
};

// Create new role
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: "Role with this name already exists"
            });
        }

        const role = await Role.create({
            name,
            description,
            permissions: permissions || []
        });

        const populatedRole = await Role.findById(role._id).populate('permissions');

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: populatedRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating role",
            error: error.message
        });
    }
};

// Update role
export const updateRole = async (req, res) => {
    try {
        const { name, description, permissions, isActive } = req.body;

        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Prevent updating Super Admin role
        if (role.name === 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: "Cannot modify Super Admin role - it is system protected"
            });
        }

        // Prevent updating default roles' names
        const defaultRoles = ['Super Admin', 'Admin', 'Agent', 'User'];
        if (defaultRoles.includes(role.name) && name && name !== role.name) {
            return res.status(400).json({
                success: false,
                message: "Cannot change name of default roles"
            });
        }

        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions) role.permissions = permissions;
        if (isActive !== undefined) role.isActive = isActive;

        await role.save();

        const updatedRole = await Role.findById(role._id).populate('permissions');

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: updatedRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating role",
            error: error.message
        });
    }
};

// Delete role
export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Prevent deleting Super Admin role
        if (role.name === 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: "Cannot delete Super Admin role - it is system protected"
            });
        }

        // Prevent deleting default roles
        const defaultRoles = ['Super Admin', 'Admin', 'Agent', 'User'];
        if (defaultRoles.includes(role.name)) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete default roles"
            });
        }

        // Check if any users have this role
        const Register = (await import('../models/Register.js')).default;
        const usersWithRole = await Register.countDocuments({ roles: req.params.id });

        if (usersWithRole > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role - ${usersWithRole} user(s) are assigned to this role. Please reassign them first.`
            });
        }

        await role.deleteOne();

        res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting role",
            error: error.message
        });
    }
};

// Assign permissions to role
export const assignPermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        const role = await Role.findById(req.params.id);
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Prevent modifying Super Admin permissions
        if (role.name === 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: "Cannot modify Super Admin permissions - it has full system access"
            });
        }

        role.permissions = permissions;
        await role.save();

        const updatedRole = await Role.findById(role._id).populate('permissions');

        res.status(200).json({
            success: true,
            message: "Permissions assigned successfully",
            data: updatedRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error assigning permissions",
            error: error.message
        });
    }
};

// Get all permissions
export const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching permissions",
            error: error.message
        });
    }
};

// Create permission
export const createPermission = async (req, res) => {
    try {
        const { name, code, description, module } = req.body;

        const existingPermission = await Permission.findOne({ $or: [{ code }, { name }] });
        if (existingPermission) {
            return res.status(400).json({
                success: false,
                message: "Permission with this code or name already exists"
            });
        }

        const permission = await Permission.create({
            name,
            code,
            description,
            module
        });

        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating permission",
            error: error.message
        });
    }
};

// Update permission
export const updatePermission = async (req, res) => {
    try {
        const { name, code, description, module, isActive } = req.body;

        const permission = await Permission.findById(req.params.id);
        
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found"
            });
        }

        if (name) permission.name = name;
        if (code) permission.code = code;
        if (description !== undefined) permission.description = description;
        if (module) permission.module = module;
        if (isActive !== undefined) permission.isActive = isActive;

        await permission.save();

        res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: permission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating permission",
            error: error.message
        });
    }
};

// Delete permission
export const deletePermission = async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found"
            });
        }

        // Remove permission from all roles
        await Role.updateMany(
            { permissions: permission._id },
            { $pull: { permissions: permission._id } }
        );

        await permission.deleteOne();

        res.status(200).json({
            success: true,
            message: "Permission deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting permission",
            error: error.message
        });
    }
};
