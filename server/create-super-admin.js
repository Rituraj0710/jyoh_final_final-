import mongoose from 'mongoose';
import UserModel from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Delete any existing admin users
    await UserModel.deleteMany({ 
      $or: [
        { email: 'admin@example.com' },
        { email: 'id-admin@gmail.com' }
      ]
    });
    console.log('Deleted existing admin users');

    // Create new super admin user
    const superAdmin = new UserModel({
      name: 'Super Administrator',
      email: 'id-admin@gmail.com',
      phone: '+1234567890',
      password: 'admin1234', // Let the pre-save hook handle hashing
      role: 'admin',
      department: 'Super Administration',
      employeeId: 'SUPER_ADMIN_001',
      isActive: true,
      isEmailVerified: true,
      is_verified: true
    });

    await superAdmin.save();
    console.log('✅ Super Admin user created successfully');

    // Verify the super admin user
    const savedAdmin = await UserModel.findOne({ email: 'id-admin@gmail.com' }).select('+password');
    console.log('Super Admin verification:', {
      email: savedAdmin.email,
      role: savedAdmin.role,
      isActive: savedAdmin.isActive,
      hasPassword: !!savedAdmin.password
    });

    // Test password comparison
    const passwordMatch = await savedAdmin.comparePassword('admin1234');
    console.log('Password test result:', passwordMatch ? '✅ Match' : '❌ No match');

    console.log('\n🎯 Super Admin Login Credentials:');
    console.log('Email: id-admin@gmail.com');
    console.log('Password: admin1234');
    console.log('Role: Super Administrator');

  } catch (error) {
    console.error('Error creating super admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSuperAdmin();
