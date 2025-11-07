import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetStaffPasswords = async () => {
  try {
    // Connect to MongoDB
    const DATABASE_URL = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Staff accounts and their default password
    const staffAccounts = [
      { email: 'staff1@test.com', role: 'staff1' },
      { email: 'staff2@test.com', role: 'staff2' },
      { email: 'staff3@test.com', role: 'staff3' },
      { email: 'staff4@test.com', role: 'staff4' },
      { email: 'staff5@test.com', role: 'staff5' }
    ];

    const newPassword = 'Demo@1122';

    // Update each staff account - use save() to trigger password hashing
    for (const staff of staffAccounts) {
      const user = await User.findOne({ email: staff.email });
      
      if (user) {
        // Set password directly - pre-save middleware will hash it
        user.password = newPassword;
        // Mark password as modified to ensure pre-save middleware runs
        user.markModified('password');
        await user.save();
        console.log(`✅ Updated password for ${staff.email} (${staff.role})`);
      } else {
        console.log(`⚠️  User not found: ${staff.email}`);
      }
    }

    // Verify passwords were updated
    console.log('\n🔍 Verifying password updates...');
    for (const staff of staffAccounts) {
      const user = await User.findOne({ email: staff.email }).select('+password');
      if (user) {
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log(`${isMatch ? '✅' : '❌'} Password verification for ${staff.email}: ${isMatch ? 'PASS' : 'FAIL'}`);
      }
    }

    console.log('\n✅ Password reset completed!');
    console.log('\n📋 Login Credentials:');
    staffAccounts.forEach(staff => {
      console.log(`   ${staff.email} / ${newPassword}`);
    });

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
resetStaffPasswords();

