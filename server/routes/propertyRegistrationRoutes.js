import express from 'express';
import passport from 'passport';
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import PropertyRegistrationController from "../controllers/propertyRegistrationController.js";
import { body, validationResult } from 'express-validator';
import { syncToFormsData } from "../middlewares/formSyncMiddleware.js";

const router = express.Router();

// Validation middleware for Property Registration
const validatePropertyRegistration = [
  // Seller validation
  body('seller_name')
    .notEmpty()
    .withMessage('विक्रेता का नाम आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('विक्रेता का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),

  body('seller_father_name')
    .notEmpty()
    .withMessage('विक्रेता के पिता/पति का नाम आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('पिता/पति का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),

  body('seller_address')
    .notEmpty()
    .withMessage('विक्रेता का पता आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('पता 500 अक्षरों से अधिक नहीं हो सकता।'),

  body('seller_aadhaar')
    .optional()
    .matches(/^[0-9]{12}$/)
    .withMessage('आधार नंबर 12 अंकों का होना चाहिए।'),

  body('seller_mobile')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('मोबाइल नंबर 10 अंकों का होना चाहिए।'),

  // Buyer validation
  body('buyer_name')
    .notEmpty()
    .withMessage('खरीदार का नाम आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('खरीदार का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),

  body('buyer_father_name')
    .notEmpty()
    .withMessage('खरीदार के पिता/पति का नाम आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('पिता/पति का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),

  body('buyer_address')
    .notEmpty()
    .withMessage('खरीदार का पता आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('पता 500 अक्षरों से अधिक नहीं हो सकता।'),

  body('buyer_aadhaar')
    .optional()
    .matches(/^[0-9]{12}$/)
    .withMessage('आधार नंबर 12 अंकों का होना चाहिए।'),

  body('buyer_mobile')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('मोबाइल नंबर 10 अंकों का होना चाहिए।'),

  // Property validation
  body('property_address')
    .notEmpty()
    .withMessage('संपत्ति का पता आवश्यक है।')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('संपत्ति का पता 500 अक्षरों से अधिक नहीं हो सकता।'),

  body('property_type')
    .notEmpty()
    .withMessage('संपत्ति का प्रकार आवश्यक है।')
    .isIn(['आवासीय', 'व्यावसायिक', 'कृषि'])
    .withMessage('संपत्ति का प्रकार आवासीय, व्यावसायिक, या कृषि होना चाहिए।'),

  body('area_sqm')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('क्षेत्रफल 50 अक्षरों से अधिक नहीं हो सकता।'),

  body('sale_price')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('बिक्री मूल्य 50 अक्षरों से अधिक नहीं हो सकता।'),

  body('registration_date')
    .optional()
    .isISO8601()
    .withMessage('पंजीकरण की तिथि वैध ISO 8601 प्रारूप में होनी चाहिए।')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array()
    });
  }
  next();
};

// Apply optional authentication middleware to all routes
router.use((req, res, next) => {
  passport.authenticate('userOrAgent', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
});
router.use(accessTokenAutoRefresh);
router.use(setAuthHeader);

// Routes
router.post("/", syncToFormsData, validatePropertyRegistration, handleValidationErrors, PropertyRegistrationController.create);
router.get("/", PropertyRegistrationController.getAll);
router.get("/stats", PropertyRegistrationController.getStats);
router.get("/:id", PropertyRegistrationController.getById);
router.put("/:id/status", PropertyRegistrationController.updateStatus);
router.delete("/:id", PropertyRegistrationController.delete);

export default router;