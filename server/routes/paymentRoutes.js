import express from "express";
import passport from "passport";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import setAuthHeader from "../middlewares/setAuthHeader.js";

const router = express.Router();

// Payment initialization endpoint
router.post("/initialize", setAuthHeader, accessTokenAutoRefresh, async (req, res) => {
  try {
    const { formType, formData, amount, userInfo } = req.body;

    // Validate required fields
    if (!formType || !formData || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: formType, formData, amount"
      });
    }

    // Generate transaction ID
    const txnid = `TXN${Date.now()}`;

    // For now, return mock payment data
    // In production, you would integrate with actual payment gateway
    const paymentData = {
      key: 'gtKFFx', // Your PayU key
      txnid: txnid,
      amount: amount,
      productinfo: `${formType} Form Submission`,
      firstname: userInfo?.name || 'User',
      email: userInfo?.email || 'bonehookadvt01@gmail.com',
      phone: userInfo?.phone || '9999999999',
      surl: `${req.protocol}://${req.get('host')}/payment/success`,
      furl: `${req.protocol}://${req.get('host')}/payment/failure`,
      hash: 'mock_hash_for_testing', // In production, generate proper hash
      service_provider: 'payu_paisa'
    };

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: paymentData
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment'
    });
  }
});

export default router;
