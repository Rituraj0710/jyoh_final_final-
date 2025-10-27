import crypto from 'crypto';
import logger from '../config/logger.js';

class PaymentController {
  // PayU Money configuration
  static payuConfig = {
    key: 'gtKFFx',
    salt: 'eCwWELxi',
    testUrl: 'https://test.payu.in/_payment',
    productionUrl: 'https://secure.payu.in/_payment'
  };

  // Test method
  static test = async (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Payment controller is working'
    });
  };

  // Generate PayU hash
  static generatePayUHash = (data) => {
    try {
      const {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        salt
      } = data;

      // Create hash string in the format required by PayU
      const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
      
      // Generate SHA512 hash
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');
      
      logger.info('PayU hash generated successfully', { txnid, amount });
      return hash;
    } catch (error) {
      logger.error('Error generating PayU hash:', error);
      throw new Error('Failed to generate payment hash');
    }
  };

  // Initialize payment
  static initializePayment = async (req, res) => {
    try {
      const {
        formType,
        formData,
        amount,
        userInfo
      } = req.body;

      // Validate required fields
      if (!formType || !formData || !amount) {
        return res.status(400).json({
          status: 'failed',
          message: 'Missing required payment information'
        });
      }

      // Generate transaction ID
      const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // Prepare PayU data
      const payuData = {
        key: this.payuConfig.key,
        salt: this.payuConfig.salt,
        txnid: txnid,
        amount: amount,
        productinfo: `${formType} Form Submission`,
        firstname: userInfo?.name || formData?.name || formData?.trustName || 'User',
        email: userInfo?.email || 'bonehookadvt01@gmail.com',
        phone: userInfo?.phone || formData?.phone || formData?.mobile || '9999999999',
        surl: `${process.env.FRONTEND_HOST}/payment/success`,
        furl: `${process.env.FRONTEND_HOST}/payment/failure`
      };

      // Generate hash
      const hash = this.generatePayUHash(payuData);

      // Return payment data with hash
      res.status(200).json({
        status: 'success',
        message: 'Payment initialized successfully',
        data: {
          ...payuData,
          hash: hash,
          paymentUrl: this.payuConfig.testUrl, // Use test URL for development
          formData: formData,
          formType: formType
        }
      });

      logger.info('Payment initialized successfully', { 
        txnid, 
        amount, 
        formType,
        userId: req.user?.id 
      });

    } catch (error) {
      logger.error('Error initializing payment:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Failed to initialize payment',
        error: error.message
      });
    }
  };

  // Handle payment success callback
  static handlePaymentSuccess = async (req, res) => {
    try {
      const {
        txnid,
        amount,
        status,
        productinfo,
        firstname,
        email,
        phone,
        hash,
        key
      } = req.body;

      // Verify hash
      const expectedHash = this.generatePayUHash({
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        salt: this.payuConfig.salt
      });

      if (hash !== expectedHash) {
        logger.error('Payment hash verification failed', { txnid, hash, expectedHash });
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid payment hash'
        });
      }

      // Update form status to paid
      // This would typically update the database record
      logger.info('Payment successful', { 
        txnid, 
        amount, 
        status,
        userId: req.user?.id 
      });

      res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          txnid,
          amount,
          status,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error handling payment success:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Failed to process payment success',
        error: error.message
      });
    }
  };

  // Handle payment failure callback
  static handlePaymentFailure = async (req, res) => {
    try {
      const {
        txnid,
        amount,
        status,
        error
      } = req.body;

      logger.error('Payment failed', { 
        txnid, 
        amount, 
        status, 
        error,
        userId: req.user?.id 
      });

      res.status(200).json({
        status: 'failed',
        message: 'Payment failed',
        data: {
          txnid,
          amount,
          status,
          error,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error handling payment failure:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Failed to process payment failure',
        error: error.message
      });
    }
  };

  // Get payment status
  static getPaymentStatus = async (req, res) => {
    try {
      const { txnid } = req.params;

      if (!txnid) {
        return res.status(400).json({
          status: 'failed',
          message: 'Transaction ID is required'
        });
      }

      // In a real implementation, you would query the database
      // For now, return a mock response
      res.status(200).json({
        status: 'success',
        data: {
          txnid,
          status: 'completed',
          amount: 1000,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error getting payment status:', error);
      res.status(500).json({
        status: 'failed',
        message: 'Failed to get payment status',
        error: error.message
      });
    }
  };
}

export default PaymentController;
