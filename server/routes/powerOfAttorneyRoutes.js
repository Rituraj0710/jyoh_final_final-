import express from "express";
import multer from "multer";
import path from "path";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import PowerOfAttorneyController from "../controllers/powerOfAttorneyController.js";
import { syncToFormsData } from "../middlewares/formSyncMiddleware.js";

const router = express.Router();

// Configure multer for file uploads - using memory storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Maximum 50 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Define upload fields for power of attorney
const uploadFields = [
  // Principal (Karta) files
  { name: "party_0_idPhoto", maxCount: 1 },
  { name: "party_0_photo", maxCount: 1 },
  { name: "party_1_idPhoto", maxCount: 1 },
  { name: "party_1_photo", maxCount: 1 },
  { name: "party_2_idPhoto", maxCount: 1 },
  { name: "party_2_photo", maxCount: 1 },
  { name: "party_3_idPhoto", maxCount: 1 },
  { name: "party_3_photo", maxCount: 1 },
  { name: "party_4_idPhoto", maxCount: 1 },
  { name: "party_4_photo", maxCount: 1 },
  
  // Agent files
  { name: "party_5_idPhoto", maxCount: 1 },
  { name: "party_5_photo", maxCount: 1 },
  { name: "party_6_idPhoto", maxCount: 1 },
  { name: "party_6_photo", maxCount: 1 },
  { name: "party_7_idPhoto", maxCount: 1 },
  { name: "party_7_photo", maxCount: 1 },
  { name: "party_8_idPhoto", maxCount: 1 },
  { name: "party_8_photo", maxCount: 1 },
  { name: "party_9_idPhoto", maxCount: 1 },
  { name: "party_9_photo", maxCount: 1 },
  
  // Witness files
  { name: "party_10_idPhoto", maxCount: 1 },
  { name: "party_10_photo", maxCount: 1 },
  { name: "party_11_idPhoto", maxCount: 1 },
  { name: "party_11_photo", maxCount: 1 },
  { name: "party_12_idPhoto", maxCount: 1 },
  { name: "party_12_photo", maxCount: 1 },
  { name: "party_13_idPhoto", maxCount: 1 },
  { name: "party_13_photo", maxCount: 1 },
  { name: "party_14_idPhoto", maxCount: 1 },
  { name: "party_14_photo", maxCount: 1 },
  
  // Additional property documents
  { name: "propertyDocuments", maxCount: 10 }
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
router.post("/", syncToFormsData, upload.fields(uploadFields), PowerOfAttorneyController.create);
router.get("/", PowerOfAttorneyController.getAll);
router.get("/stats", PowerOfAttorneyController.getStats);
router.get("/user", PowerOfAttorneyController.getUserPowerOfAttorneys);
router.get("/:id", PowerOfAttorneyController.getById);
router.put("/:id/status", PowerOfAttorneyController.updateStatus);
router.delete("/:id", PowerOfAttorneyController.delete);

export default router;
