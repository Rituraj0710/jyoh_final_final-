// Initialize roles in the database
import mongoose from 'mongoose';
import Role from '../models/Role.js';
import User from '../models/User.js';

const initRoles = async () => {
  try {
    // Connect to database
    const DATABASE_URL = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/document_management';
    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to database for role initialization');

    // Get admin user to use as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }

    // Define roles
    const roles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access and management capabilities',
        permissions: ['read', 'write', 'approve', 'lock', 'audit', 'manage_staff'],
        level: 10,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'staff1',
        displayName: 'Form Review & Stamp Calculation',
        description: 'Review forms and calculate stamp paper amounts',
        permissions: ['read', 'write', 'verify_stamp'],
        level: 1,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'staff2',
        displayName: 'Trustee Details Validation',
        description: 'Validate trustee information and documents',
        permissions: ['read', 'write', 'verify_trustee'],
        level: 2,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'staff3',
        displayName: 'Land/Plot Details Verification',
        description: 'Verify land and plot details and documents',
        permissions: ['read', 'write', 'verify_land'],
        level: 3,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'staff4',
        displayName: 'Approval & Review',
        description: 'Review and approve forms after verification',
        permissions: ['read', 'write', 'approve'],
        level: 4,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'user1',
        displayName: 'Regular User',
        description: 'Standard user with form submission capabilities',
        permissions: ['read', 'write', 'submit'],
        level: 1,
        isSystemRole: true,
        createdBy: adminUser._id
      },
      {
        name: 'user2',
        displayName: 'Agent User',
        description: 'Agent with form submission and assistance capabilities',
        permissions: ['read', 'write', 'submit', 'assist'],
        level: 1,
        isSystemRole: true,
        createdBy: adminUser._id
      }
    ];

    // Clear existing roles
    await Role.deleteMany({});
    console.log('🗑️ Cleared existing roles');

    // Create roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ Created ${createdRoles.length} roles`);

    // Display created roles
    console.log('\n📋 Created Roles:');
    createdRoles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.displayName} (${role.name}) - Level: ${role.level}`);
    });

    console.log('\n🎉 Role initialization completed successfully!');

  } catch (error) {
    console.error('❌ Role initialization failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run initialization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initRoles();
}

export default initRoles;
