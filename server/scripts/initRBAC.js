import mongoose from 'mongoose';
import User from '../models/User.js';
import Form from '../models/Form.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/**
 * Initialize RBAC system with sample data
 */
const initRBAC = async () => {
  try {
    // Connect to database
    const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/document_app';
    await mongoose.connect(DATABASE_URL);
    logger.info('Connected to database for RBAC initialization');

    // Clear existing data (optional - remove in production)
    await User.deleteMany({});
    await Form.deleteMany({});
    await AuditLog.deleteMany({});
    logger.info('Cleared existing RBAC data');

    // Create sample users for each role
    const sampleUsers = [
      {
        name: 'John Smith',
        email: 'staff1@example.com',
        password: 'password123',
        role: 'staff1',
        department: 'Form Processing',
        employeeId: 'EMP001'
      },
      {
        name: 'Sarah Johnson',
        email: 'staff2@example.com',
        password: 'password123',
        role: 'staff2',
        department: 'Trustee Validation',
        employeeId: 'EMP002'
      },
      {
        name: 'Mike Wilson',
        email: 'staff3@example.com',
        password: 'password123',
        role: 'staff3',
        department: 'Land Verification',
        employeeId: 'EMP003'
      },
      {
        name: 'Lisa Brown',
        email: 'staff4@example.com',
        password: 'password123',
        role: 'staff4',
        department: 'Approval & Review',
        employeeId: 'EMP004'
      },
      {
        name: 'David Davis',
        email: 'staff5@example.com',
        password: 'password123',
        role: 'staff5',
        department: 'Final Approval',
        employeeId: 'EMP005'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
        employeeId: 'ADMIN001'
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    logger.info(`Created ${createdUsers.length} sample users`);

    // Create sample forms
    const sampleForms = [
      {
        formType: 'trust-deed',
        userId: createdUsers[0]._id,
        data: {
          trustName: 'Family Trust Fund',
          trustAddress: '123 Main Street, City, State',
          startingAmount_number: '500000',
          startingAmount_words: 'Five Lakh Rupees',
          stampPaperAmount: 5000,
          totalValue: 500000,
          formSummary: 'Family trust establishment',
          trusteeDetails: {
            trusteeName: 'John Trustee',
            trusteeAddress: '456 Trustee Lane',
            moneyAmount: 500000,
            position: 'Primary Trustee'
          },
          landDetails: {
            plotSize: '1000 sq ft',
            plotMap: 'Map reference: MAP001',
            landDocuments: ['Deed copy', 'Survey report'],
            propertyAddress: '789 Property Road'
          }
        },
        status: 'submitted',
        approvals: {
          staff1: { approved: false },
          staff2: { approved: false },
          staff3: { approved: false },
          staff4: { approved: false },
          staff5: { approved: false }
        }
      },
      {
        formType: 'will-deed',
        userId: createdUsers[0]._id,
        data: {
          testatorName: 'Robert Willmaker',
          testatorAddress: '321 Will Street',
          stampPaperAmount: 3000,
          totalValue: 300000,
          formSummary: 'Last will and testament',
          trusteeDetails: {
            trusteeName: 'Mary Executor',
            trusteeAddress: '654 Executor Avenue',
            moneyAmount: 300000,
            position: 'Executor'
          },
          landDetails: {
            plotSize: '500 sq ft',
            plotMap: 'Map reference: MAP002',
            landDocuments: ['Property deed', 'Title certificate'],
            propertyAddress: '987 Estate Lane'
          }
        },
        status: 'submitted',
        approvals: {
          staff1: { approved: false },
          staff2: { approved: false },
          staff3: { approved: false },
          staff4: { approved: false },
          staff5: { approved: false }
        }
      }
    ];

    const createdForms = await Form.insertMany(sampleForms);
    logger.info(`Created ${createdForms.length} sample forms`);

    // Create sample audit logs
    const sampleAuditLogs = [
      {
        userId: createdUsers[0]._id,
        userRole: 'staff1',
        action: 'login',
        resource: 'user',
        resourceId: createdUsers[0]._id,
        details: 'User logged in',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'low',
        status: 'success'
      },
      {
        userId: createdUsers[1]._id,
        userRole: 'staff2',
        action: 'form_view',
        resource: 'form',
        resourceId: createdForms[0]._id,
        details: 'Viewed trust deed form',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'low',
        status: 'success'
      }
    ];

    await AuditLog.insertMany(sampleAuditLogs);
    logger.info(`Created ${sampleAuditLogs.length} sample audit logs`);

    console.log('\n🎉 RBAC System Initialized Successfully!');
    console.log('\n📋 Sample Users Created:');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\n📝 Sample Forms Created:');
    createdForms.forEach((form, index) => {
      console.log(`${index + 1}. ${form.formType} - Status: ${form.status}`);
    });

    console.log('\n🔐 Login Credentials:');
    console.log('All users have password: password123');
    console.log('\n🌐 Access URLs:');
    console.log('- Login: http://localhost:3000/login');
    console.log('- Staff Dashboard: http://localhost:3000/staff/dashboard');
    console.log('- Form Viewer: http://localhost:3000/staff/form/{formId}');

    console.log('\n📊 Role Permissions:');
    console.log('- Staff 1: Form Review & Stamp Calculation');
    console.log('- Staff 2: Trustee Details Validation');
    console.log('- Staff 3: Land/Plot Details Verification');
    console.log('- Staff 4: Approval & Review');
    console.log('- Staff 5: Final Approval & Lock');

  } catch (error) {
    logger.error('RBAC initialization failed:', error);
    console.error('❌ RBAC initialization failed:', error.message);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from database');
  }
};

// Run initialization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initRBAC();
}

export default initRBAC;
