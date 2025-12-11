
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import passport strategy after dotenv is configured
import './config/passport-jwt-strategy.js';

import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import multer from "multer";
import connectDB from "./config/connectdb.js";
import passport from "passport";
import mongoose from "mongoose";
import { runDatabaseVerification } from "./utils/dbVerify.js";
import logger from "./config/logger.js";
import { generalLimiter } from "./config/rateLimits.js";
// routes
import userRoutes from "./routes/userRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import willDeedRoutes from "./routes/willDeedRoutes.js";
import saleDeedRoutes from "./routes/saleDeedRoutes.js";
import trustDeedRoutes from "./routes/trustDeedRoutes.js";
import propertyRegistrationRoutes from "./routes/propertyRegistrationRoutes.js";
import propertySaleCertificateRoutes from "./routes/propertySaleCertificateRoutes.js";
import powerOfAttorneyRoutes from "./routes/powerOfAttorneyRoutes.js";
import adoptionDeedRoutes from "./routes/adoptionDeedRoutes.js";
import formsDataRoutes from "./routes/formsDataRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
// RBAC Routes
import authRoutes from "./routes/authRoutes.js";
import rbacRoutes from "./routes/rbacRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import requestLogger from "./middlewares/requestLogger.js";
import validateRequest from "./middlewares/validateRequest.js";
// Staff and Admin Routes
import adminRoutes from "./routes/adminRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
// OTP Authentication Routes
import otpAuthRoutes from "./routes/otpAuthRoutes.js";
import unifiedOtpAuthRoutes from "./routes/unifiedOtpAuthRoutes.js";
import demoOtpAuthRoutes from "./routes/demoOtpAuthRoutes.js";
// Signup Routes
import userSignupRoutes from "./routes/userSignupRoutes.js";
import agentSignupRoutes from "./routes/agentSignupRoutes.js";
// Agent Approval Routes
import agentApprovalRoutes from "./routes/agentApprovalRoutes.js";
import agentManagementRoutes from "./routes/agentManagementRoutes.js";
import staff1Routes from "./routes/staff1Routes.js";
import staff2Routes from "./routes/staff2Routes.js";
import staff3Routes from "./routes/staff3Routes.js";
import staff4Routes from "./routes/staff4Routes.js";
import staffReportRoutes from "./routes/staffReportRoutes.js";
import stampFormRoutes from "./routes/stampFormRoutes.js";
import mapFormRoutes from "./routes/mapFormRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import supportTicketRoutes from "./routes/supportTicketRoutes.js";
 

const app = express();

const port = process.env.PORT || 4001;
const DATABASE_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
console.log(DATABASE_URL);
// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for file uploads
}));

// CORS policy - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));

// Rate limiting
app.use(generalLimiter);

// Database connection 
connectDB(DATABASE_URL);

// Connection verification and error logging
mongoose.connection.on("error", (err) => {
  console.error("🚨 MongoDB Error:", err.message);
});

mongoose.connection.once("open", async () => {
  console.log("✅ Connected successfully to MongoDB Atlas 'test' database");
  if (process.env.DB_VERIFY === "true") {
    try {
      await runDatabaseVerification();
    } catch (err) {
      console.error("❌ DB verification failed:", err?.message || err);
    }
  }
});

// JSON - Increased limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport Middleware
app.use(passport.initialize());

// Cookie parser 
app.use(cookieParser());

// Request logging middleware (improved)
app.use(requestLogger);

// Load Routes
// Test payment route inline
app.get("/api/payment/test", (req, res) => {
  res.json({ status: 'success', message: 'Payment test route working' });
});

app.use("/api/health", healthRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/will-deed", willDeedRoutes);
app.use("/api/sale-deed", saleDeedRoutes);
app.use("/api/trust-deed", trustDeedRoutes);
app.use("/api/property-registration", propertyRegistrationRoutes);
app.use("/api/property-sale-certificate", propertySaleCertificateRoutes);
app.use("/api/power-of-attorney", powerOfAttorneyRoutes);
app.use("/api/adoption-deed", adoptionDeedRoutes);
app.use("/api/forms", formsDataRoutes);

// RBAC Routes
app.use("/api/auth", authRoutes);
app.use("/api/rbac", rbacRoutes);

// OTP Authentication Routes
app.use("/api/otp-auth", otpAuthRoutes);
app.use("/api/unified-otp", unifiedOtpAuthRoutes);
app.use("/api/demo-otp", demoOtpAuthRoutes);

// Signup Routes
app.use("/api/user", userSignupRoutes);
app.use("/api/agent", agentSignupRoutes);

// Agent Approval Routes
app.use("/api/admin/agent-approval", agentApprovalRoutes);
app.use("/api/admin/agent-management", agentManagementRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/logs", logsRoutes);

 
app.use("/api/staff/1", staff1Routes);
app.use("/api/staff/2", staff2Routes);
app.use("/api/staff/3", staff3Routes);
app.use("/api/staff/4", staff4Routes);
app.use("/api/staff-reports", staffReportRoutes);
app.use("/api/stampForms", stampFormRoutes);
app.use("/api/mapForms", mapFormRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/support", supportTicketRoutes);

// Static for uploads
import fs from "fs";
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Global error handler
app.use(errorHandler);

// Handle 404 for API routes (moved to the very end)
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'API endpoint not found'
  });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS: All origins allowed for development`);
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS: All origins allowed for development`);
});

export default app;
