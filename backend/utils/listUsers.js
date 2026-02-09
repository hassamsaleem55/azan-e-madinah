import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Register from '../models/Register.js';
import Role from '../models/Role.js';
import dbConnect from '../config/db.js';

dotenv.config();

async function listUsers() {
    try {
        await dbConnect();
        const users = await Register.find().select('email name roles agencyCode').populate('roles');
        
        console.log('\n📋 Users in database:\n');
        console.log('━'.repeat(80));
        
        users.forEach(user => {
            const roleNames = user.roles.map(r => r.name).join(', ');
            console.log(`Email: ${user.email}`);
            console.log(`Name:  ${user.name}`);
            console.log(`Roles: ${roleNames}`);
            if (user.agencyCode) {
                console.log(`Agency Code: ${user.agencyCode}`);
            }
            console.log('━'.repeat(80));
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
