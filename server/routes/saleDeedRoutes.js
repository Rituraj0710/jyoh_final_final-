import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";
import SaleDeedController from "../controllers/saleDeedController.js";
import { syncToFormsData } from "../middlewares/formSyncMiddleware.js";

const router = express.Router();

// Create upload directory for sale deeds
const uploadRoot = path.join(process.cwd(), "uploads", "saledeed");
fs.mkdirSync(uploadRoot, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadRoot);
  },
  filename: function(req, file, cb) {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${ts}_${safe}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files
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

// Define upload fields for sale deed
const uploadFields = [
  { name: "sellerIdCard_1", maxCount: 1 },
  { name: "sellerPhoto_1", maxCount: 1 },
  { name: "sellerIdCard_2", maxCount: 1 },
  { name: "sellerPhoto_2", maxCount: 1 },
  { name: "sellerIdCard_3", maxCount: 1 },
  { name: "sellerPhoto_3", maxCount: 1 },
  { name: "buyerIdCard_1", maxCount: 1 },
  { name: "buyerPhoto_1", maxCount: 1 },
  { name: "buyerIdCard_2", maxCount: 1 },
  { name: "buyerPhoto_2", maxCount: 1 },
  { name: "buyerIdCard_3", maxCount: 1 },
  { name: "buyerPhoto_3", maxCount: 1 },
  { name: "witnessIdCard_1", maxCount: 1 },
  { name: "witnessPhoto_1", maxCount: 1 },
  { name: "witnessIdCard_2", maxCount: 1 },
  { name: "witnessPhoto_2", maxCount: 1 },
  { name: "propertyPhoto", maxCount: 1 },
  { name: "propertyDocuments", maxCount: 5 }
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
router.post("/", syncToFormsData, upload.fields(uploadFields), SaleDeedController.create);
router.get("/", SaleDeedController.getAll);
router.get("/stats", SaleDeedController.getStats);
router.get("/:id", SaleDeedController.getById);
router.put("/:id/status", SaleDeedController.updateStatus);
router.delete("/:id", SaleDeedController.delete);

export default router;