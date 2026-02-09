import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import Register from '../models/Register.js';
import dbConnect from '../config/db.js';

// Load environment variables
dotenv.config();

// Default permissions with their modules
const defaultPermissions = [
    // Dashboard
    { name: 'View Dashboard', code: 'dashboard.view', module: 'Dashboard', description: 'View dashboard and analytics' },
    { name: 'View Statistics', code: 'dashboard.stats', module: 'Dashboard', description: 'View detailed statistics and charts' },
    
    // Agencies
    { name: 'View Agencies', code: 'agencies.view', module: 'Users', description: 'View registered agencies' },
    { name: 'Approve Agency', code: 'agencies.approve', module: 'Users', description: 'Approve/activate agencies' },
    { name: 'Edit Agency', code: 'agencies.edit', module: 'Users', description: 'Edit agency details and settings' },
    { name: 'Delete Agency', code: 'agencies.delete', module: 'Users', description: 'Delete agencies' },
    { name: 'View Agency Details', code: 'agencies.details', module: 'Users', description: 'View detailed agency information' },
    
    // Bookings
    { name: 'View Bookings', code: 'bookings.view', module: 'Bookings', description: 'View all bookings' },
    { name: 'View Booking Details', code: 'bookings.details', module: 'Bookings', description: 'View detailed booking information' },
    { name: 'Edit Booking', code: 'bookings.edit', module: 'Bookings', description: 'Edit existing bookings' },
    { name: 'Delete Booking', code: 'bookings.delete', module: 'Bookings', description: 'Delete bookings' },
    { name: 'Approve Booking', code: 'bookings.approve', module: 'Bookings', description: 'Approve pending bookings' },
    { name: 'Cancel Booking', code: 'bookings.cancel', module: 'Bookings', description: 'Cancel bookings' },
    
    // Group Ticketing
    { name: 'View Groups', code: 'groups.view', module: 'Bookings', description: 'View group ticketing' },
    { name: 'Create Group', code: 'groups.create', module: 'Bookings', description: 'Create new group tickets' },
    { name: 'Edit Group', code: 'groups.edit', module: 'Bookings', description: 'Edit group tickets' },
    { name: 'Delete Group', code: 'groups.delete', module: 'Bookings', description: 'Delete group tickets' },
    
    // Payments/Ledger
    { name: 'View Accounts', code: 'ledger.view', module: 'Payments', description: 'View ledger accounts' },
    { name: 'View Payment Vouchers', code: 'payments.view', module: 'Payments', description: 'View payment vouchers' },
    { name: 'Create Payment', code: 'payments.create', module: 'Payments', description: 'Create payment vouchers' },
    { name: 'Edit Payment', code: 'payments.edit', module: 'Payments', description: 'Edit payment vouchers' },
    { name: 'Delete Payment', code: 'payments.delete', module: 'Payments', description: 'Delete payment vouchers' },
    { name: 'Approve Payment', code: 'payments.approve', module: 'Payments', description: 'Approve payment vouchers' },
    
    // Airlines
    { name: 'View Airlines', code: 'airlines.view', module: 'Airlines', description: 'View airlines list' },
    { name: 'Add Airline', code: 'airlines.create', module: 'Airlines', description: 'Add new airlines' },
    { name: 'Edit Airline', code: 'airlines.edit', module: 'Airlines', description: 'Edit airline details' },
    { name: 'Delete Airline', code: 'airlines.delete', module: 'Airlines', description: 'Delete airlines' },
    
    // Banks
    { name: 'View Banks', code: 'banks.view', module: 'Banks', description: 'View bank accounts' },
    { name: 'Add Bank', code: 'banks.create', module: 'Banks', description: 'Add new banks' },
    { name: 'Edit Bank', code: 'banks.edit', module: 'Banks', description: 'Edit bank details' },
    { name: 'Delete Bank', code: 'banks.delete', module: 'Banks', description: 'Delete banks' },
    
    // Sectors
    { name: 'View Sectors', code: 'sectors.view', module: 'Sectors', description: 'View flight sectors' },
    { name: 'Add Sector', code: 'sectors.create', module: 'Sectors', description: 'Add new sectors' },
    { name: 'Edit Sector', code: 'sectors.edit', module: 'Sectors', description: 'Edit sector details' },
    { name: 'Delete Sector', code: 'sectors.delete', module: 'Sectors', description: 'Delete sectors' },
    
    // Reports
    { name: 'View Reports', code: 'reports.view', module: 'Reports', description: 'View and generate reports' },
    { name: 'Export Reports', code: 'reports.export', module: 'Reports', description: 'Export reports to Excel/PDF' },
    
    // Settings & System
    { name: 'Manage Roles', code: 'settings.roles', module: 'Settings', description: 'Manage roles and permissions' },
    { name: 'Manage Permissions', code: 'settings.permissions', module: 'Settings', description: 'Manage system permissions' },
    { name: 'System Settings', code: 'settings.system', module: 'Settings', description: 'Manage system settings' },
    { name: 'Send Emails', code: 'system.email', module: 'Settings', description: 'Send system emails' }
];

// Default roles with their permissions
const defaultRoles = [
    {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: 'all' // Will get all permissions
    },
    {
        name: 'Admin',
        description: 'Full administrative access except role management',
        permissions: [
            'dashboard.view', 'dashboard.stats',
            'agencies.view', 'agencies.approve', 'agencies.edit', 'agencies.details',
            'bookings.view', 'bookings.details', 'bookings.edit', 'bookings.approve', 'bookings.cancel',
            'groups.view', 'groups.create', 'groups.edit', 'groups.delete',
            'ledger.view', 'payments.view', 'payments.create', 'payments.edit', 'payments.approve',
            'airlines.view', 'airlines.create', 'airlines.edit', 'airlines.delete',
            'banks.view', 'banks.create', 'banks.edit', 'banks.delete',
            'sectors.view', 'sectors.create', 'sectors.edit', 'sectors.delete',
            'reports.view', 'reports.export'
        ]
    },
    {
        name: 'Operations Manager',
        description: 'Manage bookings, payments, and approvals',
        permissions: [
            'dashboard.view', 'dashboard.stats',
            'agencies.view', 'agencies.approve', 'agencies.details',
            'bookings.view', 'bookings.details', 'bookings.edit', 'bookings.approve', 'bookings.cancel',
            'groups.view', 'groups.create', 'groups.edit',
            'ledger.view', 'payments.view', 'payments.approve',
            'airlines.view', 'banks.view', 'sectors.view',
            'reports.view', 'reports.export'
        ]
    },
    {
        name: 'Booking Manager',
        description: 'Manage bookings and group ticketing',
        permissions: [
            'dashboard.view',
            'agencies.view', 'agencies.details',
            'bookings.view', 'bookings.details', 'bookings.edit',
            'groups.view', 'groups.create', 'groups.edit',
            'airlines.view', 'banks.view', 'sectors.view',
            'reports.view'
        ]
    },
    {
        name: 'Finance Manager',
        description: 'Manage payments, ledger, and financial reports',
        permissions: [
            'dashboard.view', 'dashboard.stats',
            'agencies.view', 'agencies.details',
            'bookings.view', 'bookings.details',
            'ledger.view', 'payments.view', 'payments.create', 'payments.edit', 'payments.approve',
            'banks.view',
            'reports.view', 'reports.export'
        ]
    },
    {
        name: 'Support Staff',
        description: 'View-only access for customer support',
        permissions: [
            'dashboard.view',
            'agencies.view', 'agencies.details',
            'bookings.view', 'bookings.details',
            'groups.view',
            'ledger.view', 'payments.view',
            'airlines.view', 'banks.view', 'sectors.view'
        ]
    },
    {
        name: 'Data Manager',
        description: 'Manage airlines, banks, and sectors configuration',
        permissions: [
            'dashboard.view',
            'airlines.view', 'airlines.create', 'airlines.edit', 'airlines.delete',
            'banks.view', 'banks.create', 'banks.edit', 'banks.delete',
            'sectors.view', 'sectors.create', 'sectors.edit', 'sectors.delete'
        ]
    },
    {
        name: 'Agent',
        description: 'Travel agent with limited admin access',
        permissions: [
            'dashboard.view',
            'bookings.view', 'bookings.details',
            'groups.view',
            'payments.view',
            'airlines.view', 'banks.view', 'sectors.view'
        ]
    }
];

async function seedRolesAndPermissions() {
    try {
        console.log('Starting roles and permissions seeding...');

        // Create permissions
        const createdPermissions = [];
        for (const permData of defaultPermissions) {
            let permission = await Permission.findOne({ code: permData.code });
            if (!permission) {
                permission = await Permission.create(permData);
                console.log(`✓ Created permission: ${permData.name}`);
            } else {
                console.log(`- Permission already exists: ${permData.name}`);
            }
            createdPermissions.push(permission);
        }

        // Create roles
        for (const roleData of defaultRoles) {
            let role = await Role.findOne({ name: roleData.name });
            
            // Get permission IDs for this role
            let permissionIds;
            if (roleData.permissions === 'all') {
                permissionIds = createdPermissions.map(p => p._id);
            } else {
                permissionIds = createdPermissions
                    .filter(p => roleData.permissions.includes(p.code))
                    .map(p => p._id);
            }

            if (!role) {
                role = await Role.create({
                    name: roleData.name,
                    description: roleData.description,
                    permissions: permissionIds
                });
                console.log(`✓ Created role: ${roleData.name} with ${permissionIds.length} permissions`);
            } else {
                // Update permissions if role exists
                role.permissions = permissionIds;
                role.description = roleData.description;
                await role.save();
                console.log(`- Updated role: ${roleData.name} with ${permissionIds.length} permissions`);
            }
        }

        console.log('\n✅ Roles and permissions seeding completed successfully!');
        console.log('\nCreated roles:');
        const roles = await Role.find().populate('permissions');
        roles.forEach(role => {
            console.log(`  - ${role.name}: ${role.permissions.length} permissions`);
        });

    } catch (error) {
        console.error('❌ Error seeding roles and permissions:', error);
        throw error;
    }
}

export { seedRolesAndPermissions };

// Run seeder if executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename || process.argv[1].replace(/\\/g, '/').endsWith('seedRolesPermissions.js');

if (isMainModule) {
    dbConnect()
        .then(() => seedRolesAndPermissions())
        .then(() => {
            console.log('\n✅ Seeding completed. Exiting...');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
