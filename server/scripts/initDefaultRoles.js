import mongoose from 'mongoose';
import Role from '../models/Role.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const initDefaultRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Default roles to create
    const defaultRoles = [
      {
        name: 'user1',
        displayName: 'Normal User',
        description: 'Normal User - Fills forms and uploads documents',
        permissions: ['read', 'write', 'submit'],
        isSystemRole: true,
        level: 1
      },
      {
        name: 'user2',
        displayName: 'Agent',
        description: 'Agent - Works on behalf of users, assists and verifies data',
        permissions: ['read', 'write', 'submit', 'assist'],
        isSystemRole: true,
        level: 2
      },
      {
        name: 'staff1',
        displayName: 'Form Review & Stamp Calculation',
        description: 'Staff responsible for form review and stamp duty calculation',
        permissions: ['read', 'write', 'verify_stamp'],
        isSystemRole: true,
        level: 3
      },
      {
        name: 'staff2',
        displayName: 'Trustee Details Validation',
        description: 'Staff responsible for validating trustee details',
        permissions: ['read', 'write', 'verify_trustee'],
        isSystemRole: true,
        level: 4
      },
      {
        name: 'staff3',
        displayName: 'Land/Plot Details Verification',
        description: 'Staff responsible for verifying land and plot details',
        permissions: ['read', 'write', 'verify_land'],
        isSystemRole: true,
        level: 5
      },
      {
        name: 'staff4',
        displayName: 'Approval & Review',
        description: 'Staff responsible for approval and review processes',
        permissions: ['read', 'write', 'approve'],
        isSystemRole: true,
        level: 6
      },
      {
        name: 'staff5',
        displayName: 'Final Approval & Lock',
        description: 'Staff responsible for final approval and locking documents',
        permissions: ['read', 'write', 'approve', 'lock', 'audit'],
        isSystemRole: true,
        level: 7
      },
      {
        name: 'admin',
        displayName: 'System Administrator',
        description: 'System Administrator - Full control over the system',
        permissions: ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff'],
        isSystemRole: true,
        level: 10
      }
    ];

    // Find an admin user to use as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Create roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        console.log(`Role ${roleData.name} already exists, updating...`);
        await Role.findByIdAndUpdate(existingRole._id, {
          ...roleData,
          createdBy: adminUser._id,
          updatedBy: adminUser._id
        });
      } else {
        console.log(`Creating role ${roleData.name}...`);
        await Role.create({
          ...roleData,
          createdBy: adminUser._id
        });
      }
    }

    console.log('Default roles initialized successfully!');
    
    // Display all roles
    const allRoles = await Role.find().sort({ level: 1 });
    console.log('\nAll roles:');
    allRoles.forEach(role => {
      console.log(`- ${role.name} (${role.displayName}) - Level ${role.level} - Permissions: ${role.permissions.join(', ')}`);
    });

  } catch (error) {
    console.error('Error initializing default roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
initDefaultRoles();
