import Ledger from '../models/Ledger.js';
import FormsData from '../models/FormsData.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

class LedgerController {
  /**
   * Get ledger entries for a user
   */
  static async getUserLedger(req, res) {
    try {
      const userId = req.user.id;
      const { paymentStatus, transactionType, dateFrom, dateTo, limit, skip } = req.query;

      const filters = {
        paymentStatus,
        transactionType,
        dateFrom,
        dateTo,
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0
      };

      const entries = await Ledger.getUserLedger(userId, filters);

      res.status(200).json({
        status: 'success',
        message: 'Ledger entries retrieved successfully',
        data: entries,
        pagination: {
          total: entries.length,
          limit: filters.limit,
          skip: filters.skip
        }
      });

    } catch (error) {
      logger.error('Error fetching user ledger:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching ledger entries',
        error: error.message
      });
    }
  }

  /**
   * Get all ledger entries (Admin/Staff)
   */
  static async getAllLedger(req, res) {
    try {
      const { userId, paymentStatus, transactionType, dateFrom, dateTo, limit, skip } = req.query;

      const filters = {
        userId,
        paymentStatus,
        transactionType,
        dateFrom,
        dateTo,
        limit: parseInt(limit) || 100,
        skip: parseInt(skip) || 0
      };

      const entries = await Ledger.getAdminLedger(filters);
      const totals = await Ledger.getTotals(filters);

      res.status(200).json({
        status: 'success',
        message: 'Ledger entries retrieved successfully',
        data: entries,
        totals: {
          totalAmount: totals.totalAmount,
          totalStampDuty: totals.totalStampDuty,
          totalRegistrationCharge: totals.totalRegistrationCharge,
          totalTransactions: totals.count
        },
        pagination: {
          total: entries.length,
          limit: filters.limit,
          skip: filters.skip
        }
      });

    } catch (error) {
      logger.error('Error fetching ledger:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching ledger entries',
        error: error.message
      });
    }
  }

  /**
   * Get pending payments
   */
  static async getPendingPayments(req, res) {
    try {
      const { userId, dateFrom, dateTo, limit, skip } = req.query;

      const filters = {
        paymentStatus: 'pending',
        userId,
        dateFrom,
        dateTo,
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0
      };

      const entries = await Ledger.getAdminLedger(filters);

      res.status(200).json({
        status: 'success',
        message: 'Pending payments retrieved successfully',
        data: entries,
        count: entries.length
      });

    } catch (error) {
      logger.error('Error fetching pending payments:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error fetching pending payments',
        error: error.message
      });
    }
  }

  /**
   * Get credit report
   */
  static async getCreditReport(req, res) {
    try {
      const { userId, dateFrom, dateTo } = req.query;

      const filters = {
        userId,
        dateFrom,
        dateTo
      };

      const entries = await Ledger.find({
        ...filters,
        paymentStatus: 'completed'
      })
        .populate('userId', 'name email role')
        .populate('formId', 'serviceType formTitle status')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 });

      // Calculate credit summary
      const creditSummary = {
        totalCredits: 0,
        totalDebits: 0,
        currentBalance: 0,
        transactions: []
      };

      entries.forEach(entry => {
        creditSummary.totalCredits += entry.credit || 0;
        creditSummary.totalDebits += entry.debit || 0;
        creditSummary.currentBalance += (entry.credit || 0) - (entry.debit || 0);
        
        creditSummary.transactions.push({
          transactionId: entry.transactionId,
          date: entry.paymentDate,
          type: entry.transactionType,
          amount: entry.amount,
          credit: entry.credit,
          debit: entry.debit,
          balance: creditSummary.currentBalance,
          description: entry.notes || `${entry.transactionType} payment`
        });
      });

      res.status(200).json({
        status: 'success',
        message: 'Credit report generated successfully',
        data: {
          summary: creditSummary,
          transactions: entries
        }
      });

    } catch (error) {
      logger.error('Error generating credit report:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error generating credit report',
        error: error.message
      });
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(req, res) {
    try {
      const { transactionId } = req.params;
      const { notes } = req.body;
      const verifiedBy = req.user.id;

      const ledgerEntry = await Ledger.findOne({ transactionId });

      if (!ledgerEntry) {
        return res.status(404).json({
          status: 'failed',
          message: 'Transaction not found'
        });
      }

      if (ledgerEntry.paymentStatus === 'completed') {
        return res.status(400).json({
          status: 'failed',
          message: 'Payment already verified'
        });
      }

      // Update ledger entry
      ledgerEntry.paymentStatus = 'completed';
      ledgerEntry.verifiedBy = verifiedBy;
      ledgerEntry.verifiedAt = new Date();
      if (notes) ledgerEntry.notes = notes;

      await ledgerEntry.save();

      // Update form payment status
      const form = await FormsData.findById(ledgerEntry.formId);
      if (form) {
        form.paymentInfo = form.paymentInfo || {};
        form.paymentInfo.paymentVerified = true;
        form.paymentInfo.verifiedBy = verifiedBy;
        form.paymentInfo.verifiedAt = new Date();
        form.paymentInfo.paymentNotes = notes || '';
        await form.save();
      }

      // Log the action
      await AuditLog.create({
        userId: verifiedBy,
        userRole: req.user.role,
        action: 'payment_verified',
        resource: 'ledger',
        resourceId: ledgerEntry._id,
        details: {
          transactionId,
          formId: ledgerEntry.formId,
          amount: ledgerEntry.amount,
          paymentMethod: ledgerEntry.paymentMethod
        },
        success: true
      });

      logger.info(`Payment verified: ${transactionId}`, {
        verifiedBy,
        transactionId,
        amount: ledgerEntry.amount
      });

      res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully',
        data: ledgerEntry
      });

    } catch (error) {
      logger.error('Error verifying payment:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error verifying payment',
        error: error.message
      });
    }
  }

  /**
   * Export ledger report (CSV)
   */
  static async exportLedgerReport(req, res) {
    try {
      const { dateFrom, dateTo, paymentStatus, transactionType } = req.query;

      const filters = {
        dateFrom,
        dateTo,
        paymentStatus,
        transactionType
      };

      const entries = await Ledger.getAdminLedger({ ...filters, limit: 10000 });

      // Generate CSV
      let csv = 'Transaction ID,Date,User,Form Type,Amount,Stamp Duty,Reg Charge,Status,Payment Method\n';
      
      entries.forEach(entry => {
        csv += `${entry.transactionId},`;
        csv += `${entry.paymentDate || entry.createdAt},`;
        csv += `${entry.userId?.name || 'N/A'},`;
        csv += `${entry.formId?.serviceType || 'N/A'},`;
        csv += `${entry.amount},`;
        csv += `${entry.stampDuty},`;
        csv += `${entry.registrationCharge},`;
        csv += `${entry.paymentStatus},`;
        csv += `${entry.paymentMethod}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ledger-report-${Date.now()}.csv"`);
      res.send(csv);

    } catch (error) {
      logger.error('Error exporting ledger report:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Error exporting ledger report',
        error: error.message
      });
    }
  }
}

export default LedgerController;
