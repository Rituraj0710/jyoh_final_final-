import FormsData from '../models/FormsData.js';
import StaffReport from '../models/StaffReport.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

class Staff5Controller {
  /**
   * Get Staff5 dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get forms ready for final approval (all staff levels complete)
      const pendingFinalApproval = await FormsData.countDocuments({
        'approvals.staff1.approved': true,
        'approvals.staff2.approved': true,
        'approvals.staff3.approved': true,
        'approvals.staff4.approved': true,
        'approvals.staff5.locked': false,
        status: 'cross_verified'
      });

      const formsLocked = await FormsData.countDocuments({
        'approvals.staff5.locked': true,
        'approvals.staff5.lockedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsApproved = await FormsData.countDocuments({
        'approvals.staff5.locked': true,
        'approvals.staff5.finalDecision': 'approved',
        'approvals.staff5.lockedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const formsRejected = await FormsData.countDocuments({
        'approvals.staff5.locked': true,
        'approvals.staff5.finalDecision': 'rejected',
        'approvals.staff5.lockedBy': userId,
        updatedAt: { $gte: today, $lt: tomorrow }
      });

      const finalReportsGenerated = await StaffReport.countDocuments({
        staffId: userId,
        role: 'staff5',
        reportType: 'final_report',
        date: { $gte: today, $lt: tomorrow }
      });

      const todayTasks = pendingFinalApproval;

      // Calculate weekly progress (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyCompleted = await FormsData.countDocuments({
        'approvals.staff5.locked': true,
        'approvals.staff5.lockedBy': userId,
        updatedAt: { $gte: weekAgo }
      });

      const stats = {
        pendingFinalApproval,
        formsLocked,
        formsApproved,
        formsRejected,
        finalReportsGenerated,
        todayTasks,
        weeklyProgress: weeklyCompleted
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'dashboard_view',
        resource: 'staff5_dashboard',
        details: 'Viewed Staff5 dashboard statistics',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: stats
      });

    } catch (error) {
      logger.error('Error getting Staff5 dashboard stats:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving dashboard statistics'
      });
    }
  }

  /**
   * Get forms for Staff5 final review
   */
  static async getForms(req, res) {
    try {
      const { page = 1, limit = 10, status, formType, search, verificationStage } = req.query;
      const userId = req.user.id;
      
      // Build query for Staff5 forms - can see all forms
      let query = {};

      // Add verification stage filter
      if (verificationStage === 'staff4_complete') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': true,
          'approvals.staff5.locked': false
        };
      } else if (verificationStage === 'ready_for_final') {
        query = {
          'approvals.staff1.approved': true,
          'approvals.staff2.approved': true,
          'approvals.staff3.approved': true,
          'approvals.staff4.approved': true,
          'approvals.staff5.locked': false,
          status: 'cross_verified'
        };
      } else if (verificationStage === 'locked') {
        query = {
          'approvals.staff5.locked': true
        };
      }

      // Add other filters
      if (status) query.status = status;
      if (formType) query.serviceType = formType;
      if (search) {
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'data.applicantName': { $regex: search, $options: 'i' } },
          { 'data.trusteeName': { $regex: search, $options: 'i' } },
          { 'data.landOwner': { $regex: search, $options: 'i' } },
          { 'data.plotNumber': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      
      const forms = await FormsData.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FormsData.countDocuments(query);

      // Staff5 can see ALL form data and verification history
      const processedForms = forms.map(form => ({
        ...form.toObject(),
        data: form.data || {},
        verificationHistory: form.verificationHistory || []
      }));

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'forms_view',
        resource: 'staff5_forms',
        details: `Viewed forms for Staff5 final review`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          forms: processedForms,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff5 forms:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving forms'
      });
    }
  }

  /**
   * Get specific form for Staff5 final review
   */
  static async getFormById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const form = await FormsData.findById(id)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role');

      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Staff5 can see ALL form data and verification history
      const processedForm = {
        ...form.toObject(),
        data: form.data || {},
        verificationHistory: form.verificationHistory || []
      };

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_view',
        resource: 'staff5_form',
        resourceId: form._id,
        details: `Viewed form ${id} for Staff5 final review`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        data: {
          form: processedForm
        }
      });

    } catch (error) {
      logger.error('Error getting Staff5 form by ID:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving form'
      });
    }
  }

  /**
   * Final approval and lock by Staff5
   */
  static async finalApproval(req, res) {
    try {
      const { id } = req.params;
      const { decision, finalRemarks, lockForm } = req.body;
      const userId = req.user.id;

      const form = await FormsData.findById(id);
      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is ready for final approval
      if (!form.approvals?.staff1?.approved || !form.approvals?.staff2?.approved || 
          !form.approvals?.staff3?.approved || !form.approvals?.staff4?.approved) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is not ready for final approval. All previous staff levels must be complete.'
        });
      }

      // Check if form is already locked
      if (form.approvals?.staff5?.locked) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form is already locked and cannot be modified'
        });
      }

      const updateData = {
        'approvals.staff5': {
          locked: lockForm,
          lockedBy: userId,
          lockedAt: new Date(),
          finalDecision: decision,
          finalRemarks: finalRemarks,
          status: decision === 'approved' ? 'approved' : 'rejected'
        }
      };

      // Update form status based on decision
      if (decision === 'approved') {
        updateData.status = 'approved';
      } else {
        updateData.status = 'rejected';
      }

      // Add verification history entry
      const verificationEntry = {
        staffLevel: 'staff5',
        action: `Final ${decision}`,
        timestamp: new Date(),
        notes: finalRemarks,
        verifiedBy: userId
      };

      updateData.$push = {
        verificationHistory: verificationEntry
      };

      const updatedForm = await FormsData.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      // Generate final report if form is locked
      if (lockForm) {
        try {
          await Staff5Controller.generateFinalReport(updatedForm, userId);
        } catch (reportError) {
          logger.error('Error generating final report:', reportError);
          // Don't fail the approval if report generation fails
        }
      }

      // Log the action
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'form_final_approval',
        resource: 'staff5_form',
        resourceId: form._id,
        details: `Staff5 ${decision} and ${lockForm ? 'locked' : 'reviewed'} form`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: `Form ${decision} and ${lockForm ? 'locked' : 'reviewed'} successfully`,
        data: { form: updatedForm }
      });

    } catch (error) {
      logger.error('Error processing Staff5 final approval:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error processing final approval'
      });
    }
  }

  /**
   * Generate final report for a form
   */
  static async generateFinalReport(form, staffId) {
    try {
      const reportData = {
        formId: form._id,
        formType: form.serviceType,
        finalDecision: form.approvals?.staff5?.finalDecision,
        finalRemarks: form.approvals?.staff5?.finalRemarks,
        lockedAt: form.approvals?.staff5?.lockedAt,
        verificationSummary: {
          staff1: form.approvals?.staff1?.approved || false,
          staff2: form.approvals?.staff2?.approved || false,
          staff3: form.approvals?.staff3?.approved || false,
          staff4: form.approvals?.staff4?.approved || false
        },
        formData: form.data,
        verificationHistory: form.verificationHistory || []
      };

      // Create report record
      const report = new StaffReport({
        staffId: staffId,
        role: 'staff5',
        formId: form._id,
        reportType: 'final_report',
        reportData: reportData,
        status: 'generated',
        generatedAt: new Date()
      });

      await report.save();

      return report;
    } catch (error) {
      logger.error('Error generating final report:', error);
      throw error;
    }
  }

  /**
   * Get final reports
   */
  static async getFinalReports(req, res) {
    try {
      const { page = 1, limit = 10, status, formType, dateFrom, dateTo } = req.query;
      const userId = req.user.id;
      
      let query = {
        staffId: userId,
        role: 'staff5',
        reportType: 'final_report'
      };

      if (status) query.status = status;
      if (formType) query['reportData.formType'] = formType;
      
      if (dateFrom || dateTo) {
        query.generatedAt = {};
        if (dateFrom) query.generatedAt.$gte = new Date(dateFrom);
        if (dateTo) query.generatedAt.$lte = new Date(dateTo);
      }

      const skip = (page - 1) * limit;
      
      const reports = await StaffReport.find(query)
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await StaffReport.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          reports,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting final reports:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving final reports'
      });
    }
  }

  /**
   * Generate PDF for final report
   */
  static async generateFinalReportPDF(req, res) {
    try {
      const { formId } = req.params;
      const userId = req.user.id;

      // Get the form and report data
      const form = await FormsData.findById(formId)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email role');

      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is locked by Staff5
      if (!form.approvals?.staff5?.locked) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form must be locked before generating final report'
        });
      }

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Create HTML content for the report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Final Report - ${form.serviceType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .form-data { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .verification-status { display: flex; justify-content: space-between; margin: 10px 0; }
            .approved { color: green; font-weight: bold; }
            .rejected { color: red; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Final Verification Report</h1>
            <p>Form ID: ${form._id}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="section">
            <h3>Form Information</h3>
            <div class="form-data">
              <p><strong>Form Type:</strong> ${form.serviceType?.replace(/_/g, ' ').toUpperCase()}</p>
              <p><strong>Status:</strong> ${form.status?.replace(/_/g, ' ').toUpperCase()}</p>
              <p><strong>Submitted by:</strong> ${form.userId?.name || form.userId?.email || 'Unknown'}</p>
              <p><strong>Created:</strong> ${new Date(form.createdAt).toLocaleString()}</p>
              <p><strong>Final Decision:</strong> ${form.approvals?.staff5?.finalDecision?.toUpperCase()}</p>
              <p><strong>Locked at:</strong> ${new Date(form.approvals?.staff5?.lockedAt).toLocaleString()}</p>
            </div>
          </div>

          <div class="section">
            <h3>Verification Status</h3>
            <div class="verification-status">
              <span>Staff1 (Primary Details):</span>
              <span class="${form.approvals?.staff1?.approved ? 'approved' : 'rejected'}">
                ${form.approvals?.staff1?.approved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>
            <div class="verification-status">
              <span>Staff2 (Trustee Details):</span>
              <span class="${form.approvals?.staff2?.approved ? 'approved' : 'rejected'}">
                ${form.approvals?.staff2?.approved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>
            <div class="verification-status">
              <span>Staff3 (Land Details):</span>
              <span class="${form.approvals?.staff3?.approved ? 'approved' : 'rejected'}">
                ${form.approvals?.staff3?.approved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>
            <div class="verification-status">
              <span>Staff4 (Cross Verification):</span>
              <span class="${form.approvals?.staff4?.approved ? 'approved' : 'rejected'}">
                ${form.approvals?.staff4?.approved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>
            <div class="verification-status">
              <span>Staff5 (Final Authority):</span>
              <span class="approved">LOCKED</span>
            </div>
          </div>

          <div class="section">
            <h3>Form Data</h3>
            <div class="form-data">
              ${form.data ? Object.entries(form.data).map(([key, value]) => 
                `<p><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value || 'Not provided'}</p>`
              ).join('') : '<p>No form data available</p>'}
            </div>
          </div>

          <div class="section">
            <h3>Final Remarks</h3>
            <div class="form-data">
              <p>${form.approvals?.staff5?.finalRemarks || 'No remarks provided'}</p>
            </div>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the Staff5 Final Authority System</p>
            <p>Form is now locked and no further changes are allowed</p>
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="final-report-${formId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

    } catch (error) {
      logger.error('Error generating final report PDF:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error generating PDF report'
      });
    }
  }

  /**
   * Generate Property Registration Certificate with QR Code
   */
  static async generateCertificatePDF(req, res) {
    try {
      const { formId } = req.params;
      const userId = req.user.id;

      // Get the form and report data
      const form = await FormsData.findById(formId)
        .populate('userId', 'name email phone')
        .populate('assignedTo', 'name email role')
        .populate('approvedBy', 'name email');

      if (!form) {
        return res.status(404).json({
          status: 'failed',
          message: 'Form not found'
        });
      }

      // Check if form is locked by Staff5
      if (!form.approvals?.staff5?.locked) {
        return res.status(403).json({
          status: 'failed',
          message: 'Form must be locked before generating certificate'
        });
      }

      // Generate QR Code with basic details
      const qrData = JSON.stringify({
        formId: form._id.toString(),
        serviceType: form.serviceType,
        registrationNumber: form._id.toString().substring(0, 12).toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        stampDuty: form.paymentInfo?.calculations?.stampDuty || 0,
        registrationCharge: form.paymentInfo?.calculations?.registrationCharge || 0
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        width: 200,
        margin: 2
      });

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Create HTML content for the certificate
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Property Registration Certificate - ${form._id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Times New Roman', serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              min-height: 100vh;
            }
            .certificate-container {
              max-width: 900px;
              margin: 0 auto;
              background: white;
              border: 5px solid #667eea;
              border-radius: 10px;
              padding: 50px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .certificate-header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .certificate-title {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              text-transform: uppercase;
              letter-spacing: 3px;
              margin-bottom: 10px;
            }
            .certificate-subtitle {
              font-size: 18px;
              color: #666;
              font-style: italic;
            }
            .certificate-body {
              margin: 40px 0;
            }
            .certificate-section {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              border-radius: 5px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
              text-transform: uppercase;
              border-bottom: 2px solid #667eea;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #ddd;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              width: 40%;
            }
            .info-value {
              color: #333;
              width: 60%;
              text-align: right;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f0f4ff;
              border-radius: 10px;
            }
            .qr-code {
              margin: 20px auto;
              border: 3px solid #667eea;
              border-radius: 10px;
              padding: 10px;
              background: white;
              display: inline-block;
            }
            .stamp-section {
              margin-top: 40px;
              padding: 20px;
              background: #fff5e6;
              border: 2px dashed #ff9900;
              border-radius: 5px;
            }
            .stamp-info {
              text-align: center;
            }
            .stamp-info h3 {
              color: #ff9900;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .stamp-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 15px;
            }
            .stamp-item {
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
            .stamp-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .stamp-value {
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .verification-stamp {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              border: 3px solid #28a745;
              border-radius: 10px;
              background: #f0fff4;
            }
            .verification-text {
              font-size: 16px;
              font-weight: bold;
              color: #28a745;
              margin-bottom: 10px;
            }
            .verified-by {
              font-size: 14px;
              color: #666;
            }
            .certificate-footer {
              margin-top: 50px;
              text-align: center;
              border-top: 2px solid #ccc;
              padding-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .certificate-id {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-top: 15px;
              letter-spacing: 2px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              font-weight: bold;
              color: rgba(102, 126, 234, 0.1);
              pointer-events: none;
              user-select: none;
            }
            .position-relative {
              position: relative;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container position-relative">
            <div class="watermark">VERIFIED</div>
            
            <div class="certificate-header">
              <div class="certificate-title">Property Registration Certificate</div>
              <div class="certificate-subtitle">Official Document of Property Registration</div>
            </div>

            <div class="certificate-body">
              <div class="certificate-section">
                <div class="section-title">Property Information</div>
                <div class="info-row">
                  <span class="info-label">Registration Number:</span>
                  <span class="info-value">${form._id.toString().substring(0, 12).toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service Type:</span>
                  <span class="info-value">${form.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Property Description:</span>
                  <span class="info-value">${form.formDescription || form.formTitle || 'N/A'}</span>
                </div>
                ${form.data?.propertyArea ? `
                <div class="info-row">
                  <span class="info-label">Total Area:</span>
                  <span class="info-value">${form.data.propertyArea} ${form.data.propertyAreaUnit || 'sq meters'}</span>
                </div>
                ` : ''}
                ${form.data?.propertyDirection ? `
                <div class="info-row">
                  <span class="info-label">Direction:</span>
                  <span class="info-value">${form.data.propertyDirection}</span>
                </div>
                ` : ''}
              </div>

              <div class="certificate-section">
                <div class="section-title">Owner Details</div>
                <div class="info-row">
                  <span class="info-label">Owner Name:</span>
                  <span class="info-value">${form.userId?.name || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${form.userId?.email || 'N/A'}</span>
                </div>
                ${form.userId?.phone ? `
                <div class="info-row">
                  <span class="info-label">Contact:</span>
                  <span class="info-value">${form.userId.phone}</span>
                </div>
                ` : ''}
              </div>

              <div class="qr-section">
                <div class="section-title" style="border-bottom: none;">Verification QR Code</div>
                <div class="qr-code">
                  <img src="${qrCodeDataURL}" alt="QR Code" style="width: 150px; height: 150px;"/>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Scan this QR code to verify certificate authenticity
                </p>
              </div>

              <div class="stamp-section">
                <div class="stamp-info">
                  <h3>📋 Stamp Duty & Registration Charges</h3>
                  <div class="stamp-details">
                    <div class="stamp-item">
                      <div class="stamp-label">Stamp Duty</div>
                      <div class="stamp-value">₹${(form.paymentInfo?.calculations?.stampDuty || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="stamp-item">
                      <div class="stamp-label">Registration Charge</div>
                      <div class="stamp-value">₹${(form.paymentInfo?.calculations?.registrationCharge || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="stamp-item">
                      <div class="stamp-label">Total Paid</div>
                      <div class="stamp-value">₹${(form.paymentInfo?.paymentAmount || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="stamp-item">
                      <div class="stamp-label">Payment Date</div>
                      <div class="stamp-value">${form.paymentInfo?.paymentDate ? new Date(form.paymentInfo.paymentDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="verification-stamp">
                <div class="verification-text">✓ CERTIFICATE VERIFIED</div>
                <div class="verified-by">
                  <div><strong>Final Approval:</strong> Staff 5 Final Authority</div>
                  <div><strong>Locked Date:</strong> ${form.approvals?.staff5?.lockedAt ? new Date(form.approvals.staff5.lockedAt).toLocaleString() : new Date().toLocaleString()}</div>
                  ${form.approvedBy ? `<div><strong>Approved By:</strong> ${form.approvedBy.name || 'N/A'}</div>` : ''}
                </div>
              </div>
            </div>

            <div class="certificate-footer">
              <p>This certificate is a verified document issued by the Property Registration Authority</p>
              <p style="margin-top: 10px;">
                Generated on: ${new Date().toLocaleString()}<br>
                Certificate ID: ${form._id.toString().toUpperCase()}
              </p>
              <div class="certificate-id">
                CERT-${form._id.toString().substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });

      await browser.close();

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="property-certificate-${formId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

      // Log the action
      await AuditLog.logAction({
        userId: userId,
        userRole: 'staff5',
        action: 'certificate_generated',
        resource: 'property_certificate',
        resourceId: formId,
        details: {
          formId,
          serviceType: form.serviceType,
          certificateNumber: `CERT-${form._id.toString().substring(0, 8).toUpperCase()}`
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

    } catch (error) {
      logger.error('Error generating certificate PDF:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error generating certificate PDF',
        error: error.message
      });
    }
  }

  /**
   * Submit Staff5 work report
   */
  static async submitWorkReport(req, res) {
    try {
      const { 
        completedTasks,
        workSummary,
        issuesEncountered,
        recommendations,
        formsProcessed 
      } = req.body;

      // Get all staff reports for this staff member that are not yet submitted
      const pendingReports = await StaffReport.find({
        staffId: req.user.id,
        isSubmitted: false
      }).populate('formId', 'serviceType formTitle status');

      // Mark all pending reports as submitted
      await StaffReport.updateMany(
        { staffId: req.user.id, isSubmitted: false },
        { 
          isSubmitted: true,
          submittedAt: new Date(),
          reviewNotes: workSummary
        }
      );

      // Create a comprehensive work report entry (same format as Staff1/Staff2/Staff3/Staff4)
      const workReportData = {
        staffId: req.user.id,
        formId: null, // This is a general work report, not tied to specific form
        formType: 'work-report',
        verificationStatus: 'pending',
        remarks: workSummary,
        verificationNotes: `
          Completed Tasks: ${completedTasks?.join(', ') || 'None specified'}
          
          Work Summary: ${workSummary || 'No summary provided'}
          
          Issues Encountered: ${issuesEncountered || 'None reported'}
          
          Recommendations: ${recommendations || 'None provided'}
          
          Forms Processed: ${formsProcessed || pendingReports.length}
          
          Report Details:
          ${pendingReports.map(report => 
            `- ${report.formId?.serviceType || 'Unknown'}: ${report.verificationStatus || 'processed'}`
          ).join('\n')}
        `,
        isSubmitted: true,
        submittedAt: new Date()
      };

      // Create work report entry
      const workReport = new StaffReport(workReportData);
      await workReport.save();

      // Log activity
      await AuditLog.logAction({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'work_report_submission',
        resource: 'staff_reports',
        resourceId: workReport._id,
        details: `Staff5 submitted work report with ${pendingReports.length} processed forms`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Work report submitted successfully',
        data: {
          workReport,
          processedForms: pendingReports.length,
          submittedReports: pendingReports
        }
      });

    } catch (error) {
      logger.error('Error submitting Staff5 work report:', error);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting work report'
      });
    }
  }

  /**
   * Get today's work data for final report submission
   */
  static async getWorkData(req, res) {
    try {
      const { date } = req.query;
      const userId = req.user.id;
      
      const today = new Date(date || new Date());
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get forms locked today by this Staff5 user
      const lockedForms = await FormsData.find({
        'approvals.staff5.locked': true,
        'approvals.staff5.lockedBy': userId,
        'approvals.staff5.lockedAt': { $gte: today, $lt: tomorrow }
      }).select('_id serviceType approvals');

      // Separate forms by final decision
      const formsApproved = lockedForms
        .filter(form => form.approvals?.staff5?.finalDecision === 'approved')
        .map(form => form._id.toString());
      
      const formsRejected = lockedForms
        .filter(form => form.approvals?.staff5?.finalDecision === 'rejected')
        .map(form => form._id.toString());

      const totalFormsProcessed = lockedForms.length;

      logger.info(`Staff5 getWorkData: Found ${formsApproved.length} approved, ${formsRejected.length} rejected forms for date ${date || 'today'}`);

      res.json({
        status: 'success',
        data: {
          formsApproved,
          formsRejected,
          totalFormsProcessed
        }
      });

    } catch (error) {
      logger.error('Error getting Staff5 work data:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work data'
      });
    }
  }

  /**
   * Submit final report
   */
  static async submitFinalReport(req, res) {
    try {
      const {
        date,
        formsApproved = [],
        formsRejected = [],
        totalFormsProcessed = 0,
        finalNotes = '',
        recommendations = ''
      } = req.body;

      const userId = req.user.id;

      logger.info(`Staff5 submitFinalReport called by user: ${userId}`);
      logger.info(`Report data:`, {
        date,
        formsApproved: formsApproved.length,
        formsRejected: formsRejected.length,
        totalFormsProcessed
      });

      // Validate that at least one form is processed
      if (formsApproved.length === 0 && formsRejected.length === 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'Please select at least one form that was processed today.'
        });
      }

      // Create a comprehensive final report entry
      const reportData = {
        staffId: userId,
        formId: null, // This is a general final report, not tied to a specific form
        formType: 'final-report',
        verificationStatus: 'submitted',
        remarks: finalNotes || 'Final report submitted',
        verificationNotes: `
          Final Report - ${date}
          
          Forms Approved/Locked: ${formsApproved.length}
          ${formsApproved.map(id => `  - ${id}`).join('\n')}
          
          Forms Rejected: ${formsRejected.length}
          ${formsRejected.map(id => `  - ${id}`).join('\n')}
          
          Total Forms Processed: ${totalFormsProcessed || (formsApproved.length + formsRejected.length)}
          
          Final Notes: ${finalNotes || 'No notes provided'}
          
          Recommendations: ${recommendations || 'No recommendations provided'}
        `,
        isSubmitted: true,
        submittedAt: new Date(),
        // Store additional metadata
        metadata: {
          formsApproved,
          formsRejected,
          totalFormsProcessed,
          recommendations,
          reportDate: date
        }
      };

      const workReport = new StaffReport(reportData);
      await workReport.save();

      logger.info(`Staff5 final report submitted successfully. Report ID: ${workReport._id}`);

      // Log the action
      await AuditLog.logAction({
        userId: userId,
        userRole: req.user.role,
        action: 'final_report_submission',
        resource: 'staff_reports',
        resourceId: workReport._id,
        details: `Staff5 submitted final report with ${formsApproved.length} approved, ${formsRejected.length} rejected`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        status: 'success',
        message: 'Final report submitted successfully',
        data: {
          workReport,
          formsApproved: formsApproved.length,
          formsRejected: formsRejected.length,
          totalFormsProcessed: totalFormsProcessed || (formsApproved.length + formsRejected.length)
        }
      });

    } catch (error) {
      logger.error('Error submitting Staff5 final report:', error);
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        status: 'failed',
        message: error.message || 'Error submitting final report',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get Staff5's work reports
   */
  static async getWorkReports(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;

      const query = { staffId: req.user.id };
      if (status) query.verificationStatus = status;

      const reports = await StaffReport.find(query)
        .populate('formId', 'serviceType formTitle status fields')
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await StaffReport.countDocuments(query);

      res.json({
        status: 'success',
        data: {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error getting Staff5 work reports:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error retrieving work reports'
      });
    }
  }
}

export default Staff5Controller;
