import express from 'express';
import { authenticate, authorize, filterFieldsByRole, auditLog } from '../middlewares/rbac.js';
import {
  getFormsForRole,
  getFormById,
  approveForm,
  lockForm,
  getDashboardData
} from '../controllers/rbacController.js';

const router = express.Router();

// Public health check for RBAC
router.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'RBAC service is running' });
});

// Apply authentication to all other routes
router.use(authenticate);

// Dashboard route - accessible to all staff
router.get('/dashboard', auditLog('dashboard_access'), getDashboardData);

// Get forms for specific role
router.get('/forms', 
  filterFieldsByRole, 
  auditLog('forms_list'), 
  getFormsForRole
);

// Get specific form by ID
router.get('/forms/:id', 
  filterFieldsByRole, 
  auditLog('form_view'), 
  getFormById
);

// Approve form - role-specific
router.post('/forms/:id/approve', 
  auditLog('form_approve'), 
  approveForm
);

// Lock form - admin only (removed staff5)
router.post('/forms/:id/lock', 
  authorize('admin'), 
  auditLog('form_lock'), 
  lockForm
);

// Staff1 specific routes
router.get('/staff1/forms', 
  authorize('staff1'), 
  filterFieldsByRole, 
  auditLog('staff1_forms'), 
  getFormsForRole
);

router.post('/staff1/forms/:id/approve', 
  authorize('staff1'), 
  auditLog('staff1_approve'), 
  approveForm
);

// Staff2 specific routes
router.get('/staff2/forms', 
  authorize('staff2'), 
  filterFieldsByRole, 
  auditLog('staff2_forms'), 
  getFormsForRole
);

router.post('/staff2/forms/:id/approve', 
  authorize('staff2'), 
  auditLog('staff2_approve'), 
  approveForm
);

// Staff3 specific routes
router.get('/staff3/forms', 
  authorize('staff3'), 
  filterFieldsByRole, 
  auditLog('staff3_forms'), 
  getFormsForRole
);

router.post('/staff3/forms/:id/approve', 
  authorize('staff3'), 
  auditLog('staff3_approve'), 
  approveForm
);

// Staff4 specific routes
router.get('/staff4/forms', 
  authorize('staff4'), 
  filterFieldsByRole, 
  auditLog('staff4_forms'), 
  getFormsForRole
);

router.post('/staff4/forms/:id/approve', 
  authorize('staff4'), 
  auditLog('staff4_approve'), 
  approveForm
);


export default router;
