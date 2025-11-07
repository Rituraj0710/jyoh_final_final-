/**
 * Script to fix existing users with double-hashed passwords
 * 
 * This script will:
 * 1. Find all unverified or problem users
 * 2. Reset their passwords to a temporary password
 * 3. Set them as verified
 * 4. Send them an email with the new password
 * 
 * Run with: node --experimental-modules scripts/fixExistingUsers.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function fixExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all unverified users or users with issues
    const users = await User.find({ 
      role: { $in: ['user1', 'user2'] },
      is_verified: false 
    });

    console.log(`\n📋 Found ${users.length} users to fix\n`);

    if (users.length === 0) {
      console.log('✅ No users need fixing');
      await mongoose.disconnect();
      return;
    }

    // Reset password for each user
    for (const user of users) {
      console.log(`\n👤 Fixing user: ${user.email}`);
      
      // Generate a temporary password
      const tempPassword = `Temp${Math.random().toString(36).substr(2, 9)}`;
      
      // Update user: set password, mark as verified, clear OTP
      user.password = tempPassword; // Will be hashed by pre-save hook
      user.is_verified = true;
      user.otp = null;
      user.otpExpiry = null;
      
      await user.save();
      
      console.log(`   ✅ Fixed! Temporary password: ${tempPassword}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   ✔️ Verified: true`);
      
      // You can also send an email with the new password here
      // await sendPasswordResetEmail(user.email, tempPassword);
    }

    console.log(`\n✅ Fixed ${users.length} user(s)\n`);
    console.log('📝 Note: Users need to reset their password or use the temporary password');
    console.log('📝 To implement proper password reset, use:');
    console.log('   POST /api/auth/reset-password');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
fixExistingUsers();
