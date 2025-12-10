import express from "express";
import multer from "multer";
import path from "path";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import TrustDeedController from "../controllers/trustDeedController.js";
import { syncToFormsData } from "../middlewares/formSyncMiddleware.js";

const router = express.Router();

// Configure multer for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'), false);
    }
  }
});

// Define upload fields for Multer
const uploadFields = [
  { name: "trusteeIdCard_1", maxCount: 1 },
  { name: "trusteePhoto_1", maxCount: 1 },
  { name: "trusteeIdCard_2", maxCount: 1 },
  { name: "trusteePhoto_2", maxCount: 1 },
  { name: "trusteeIdCard_3", maxCount: 1 },
  { name: "trusteePhoto_3", maxCount: 1 },
  { name: "trusteeIdCard_4", maxCount: 1 },
  { name: "trusteePhoto_4", maxCount: 1 },
  { name: "trusteeIdCard_5", maxCount: 1 },
  { name: "trusteePhoto_5", maxCount: 1 },
  { name: "witnessIdCard_1", maxCount: 1 },
  { name: "witnessPhoto_1", maxCount: 1 },
  { name: "witnessIdCard_2", maxCount: 1 },
  { name: "witnessPhoto_2", maxCount: 1 },
];

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
router.post("/", syncToFormsData, upload.fields(uploadFields), TrustDeedController.create);
router.get("/", TrustDeedController.getAll);
router.get("/stats", TrustDeedController.getStats);
router.get("/:id", TrustDeedController.getById);
router.put("/:id/status", TrustDeedController.updateStatus);
router.delete("/:id", TrustDeedController.delete);

// Payment initialization endpoint
router.post("/payment/initialize", TrustDeedController.initializePayment);

export default router;