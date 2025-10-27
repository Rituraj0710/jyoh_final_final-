import express from 'express';
import multer from 'multer';
import path from 'path';
import AdoptionDeedController from '../controllers/adoptionDeedController.js';
import passport from 'passport';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import setAuthHeader from '../middlewares/setAuthHeader.js';
import { syncToFormsData } from '../middlewares/formSyncMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/adoptiondeed/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Define upload fields for different types of files
const uploadFields = [
  { name: 'childPhoto', maxCount: 1 },
  { name: 'childBirthCert', maxCount: 1 },
  { name: 'childID', maxCount: 1 },
  { name: 'firstPartyPhoto', maxCount: 10 },
  { name: 'secondPartyPhoto', maxCount: 10 },
  { name: 'witnessPhoto', maxCount: 10 }
];

// Middleware for optional authentication
const authenticate = [
  (req, res, next) => {
    passport.authenticate('userOrAgent', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  },
  accessTokenAutoRefresh,
  setAuthHeader
];

// Routes

// Create adoption deed
router.post('/', syncToFormsData, authenticate, upload.fields(uploadFields), AdoptionDeedController.create);

// Get all adoption deeds (with pagination and filters)
router.get('/', authenticate, AdoptionDeedController.getAll);

// Get adoption deed statistics
router.get('/stats', authenticate, AdoptionDeedController.getStats);

// Get user's adoption deeds
router.get('/user', authenticate, AdoptionDeedController.getUserAdoptionDeeds);

// Get adoption deed by ID
router.get('/:id', authenticate, AdoptionDeedController.getById);

// Update adoption deed status
router.put('/:id/status', authenticate, AdoptionDeedController.updateStatus);

// Delete adoption deed
router.delete('/:id', authenticate, AdoptionDeedController.delete);

export default router;
