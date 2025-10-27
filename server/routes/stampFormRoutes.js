import express from 'express';
import StampFormController from '../controllers/stampFormController.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { authLimiter } from '../config/rateLimits.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules for stamp form creation/update
const stampFormValidation = [
  body('article').notEmpty().withMessage('Article is required'),
  body('property').notEmpty().withMessage('Property is required'),
  body('consideredPrice').isNumeric().withMessage('Considered price must be a number'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('amountWords').notEmpty().withMessage('Amount in words is required'),
  body('firstParty.name').notEmpty().withMessage('First party name is required'),
  body('firstParty.address').notEmpty().withMessage('First party address is required'),
  body('secondParty.name').notEmpty().withMessage('Second party name is required'),
  body('secondParty.address').notEmpty().withMessage('Second party address is required'),
  body('paidBy').notEmpty().withMessage('Paid by is required'),
  body('purchasedBy').notEmpty().withMessage('Purchased by is required')
];

// GET /api/stampForms - Get all stamp forms (Admin and Staff 2 only)
router.get('/',
  authLimiter,
  ...authorizeRoles('admin', 'staff2'),
  StampFormController.getAllStampForms
);

// GET /api/stampForms/user/:userId - Get stamp forms for a specific user
router.get('/user/:userId',
  authLimiter,
  ...authorizeRoles('admin', 'staff2'),
  StampFormController.getUserStampForms
);

// GET /api/stampForms/:formId - Get single stamp form
router.get('/:formId',
  authLimiter,
  ...authorizeRoles('admin', 'staff2'),
  StampFormController.getStampForm
);

// POST /api/stampForms - Create new stamp form
router.post('/',
  authLimiter,
  ...authorizeRoles('staff2'),
  ...stampFormValidation,
  validateRequest,
  StampFormController.createStampForm
);

// PUT /api/stampForms/:formId - Update stamp form
router.put('/:formId',
  authLimiter,
  ...authorizeRoles('staff2'),
  ...stampFormValidation,
  validateRequest,
  StampFormController.updateStampForm
);

// DELETE /api/stampForms/:formId - Delete stamp form
router.delete('/:formId',
  authLimiter,
  ...authorizeRoles('staff2', 'admin'),
  StampFormController.deleteStampForm
);

// GET /api/stampForms/:formId/pdf - Generate PDF for stamp form
router.get('/:formId/pdf',
  authLimiter,
  ...authorizeRoles('admin', 'staff2'),
  StampFormController.generatePDF
);

// POST /api/stampForms/:formId/verify - Verify stamp form
router.post('/:formId/verify',
  authLimiter,
  ...authorizeRoles('staff2'),
  [
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validateRequest,
  StampFormController.verifyStampForm
);

// POST /api/stampForms/auto-create/:userFormId - Auto-create stamp form from user form
router.post('/auto-create/:userFormId',
  authLimiter,
  ...authorizeRoles('staff2'),
  StampFormController.autoCreateFromUserForm
);

export default router;
