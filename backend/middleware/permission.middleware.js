import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Register from "../models/Register.js";

// Middleware to check if user has specific permission
// Checks against active role if provided in header, otherwise checks all roles
export const checkPermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const activeRoleId = req.headers['x-active-role'];

            // Find user with populated roles and permissions
            const user = await Register.findById(userId).populate({
                path: 'roles',
                populate: {
                    path: 'permissions'
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Super Admin has all permissions (check if active role is Super Admin when specified)
            if (activeRoleId) {
                const activeRole = user.roles?.find(r => r._id.toString() === activeRoleId);
                if (activeRole?.name === 'Super Admin') {
                    return next();
                }
            } else {
                const hasSuperAdminRole = user.roles && user.roles.some(role => role.name === 'Super Admin');
                if (hasSuperAdminRole) {
                    return next();
                }
            }

            // Check if user has the required permission
            let hasPermission = false;
            
            if (activeRoleId) {
                // Check only the active role's permissions
                const activeRole = user.roles?.find(r => r._id.toString() === activeRoleId);
                
                if (activeRole && activeRole.permissions) {
                    hasPermission = activeRole.permissions.some(permission =>
                        permission.code === permissionCode && permission.isActive
                    );
                }
            } else {
                // Check all roles' permissions
                if (user.roles && user.roles.length > 0) {
                    for (const role of user.roles) {
                        if (role.permissions && role.permissions.some(permission =>
                            permission.code === permissionCode && permission.isActive
                        )) {
                            hasPermission = true;
                            break;
                        }
                    }
                }
            }

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You don't have permission to perform this action"
                });
            }

            next();
        } catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions"
            });
        }
    };
};

// Middleware to check if user has any of the specified roles
// Checks against active role if provided in header, otherwise checks all roles
export const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const activeRoleId = req.headers['x-active-role'];

            const user = await Register.findById(userId).populate('roles');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Get user's role names
            const userRoleNames = user.roles ? user.roles.map(r => r.name) : [];
            
            // If active role is specified, check only that role
            if (activeRoleId) {
                const activeRole = user.roles?.find(r => r._id.toString() === activeRoleId);
                
                if (!activeRole) {
                    console.log(`❌ Active role not found for user ${user.email}`);
                    return res.status(403).json({
                        success: false,
                        message: "Invalid active role"
                    });
                }
                
                const hasAllowedRole = allowedRoles.includes(activeRole.name);
                
                if (!hasAllowedRole) {
                    console.log(`❌ Access denied for user ${user.email}`);
                    console.log(`   Active role: ${activeRole.name}`);
                    console.log(`   Required roles: [${allowedRoles.join(', ')}]`);
                    
                    return res.status(403).json({
                        success: false,
                        message: "Access denied. Insufficient role privileges"
                    });
                }
            } else {
                // No active role specified, check if user has any of the allowed roles
                const hasAllowedRole = user.roles && user.roles.some(role => 
                    allowedRoles.includes(role.name)
                );

                if (!hasAllowedRole) {
                    console.log(`❌ Access denied for user ${user.email}`);
                    console.log(`   User roles: [${userRoleNames.join(', ')}]`);
                    console.log(`   Required roles: [${allowedRoles.join(', ')}]`);
                    
                    return res.status(403).json({
                        success: false,
                        message: "Access denied. Insufficient role privileges"
                    });
                }
            }

            next();
        } catch (error) {
            console.error("Role check error:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking role"
            });
        }
    };
};
