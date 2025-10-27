import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      data: {
        server: 'running',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Database connectivity test
router.get('/db', async (req, res) => {
  try {
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Try a simple query to test database
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      res.status(200).json({
        success: true,
        message: 'Database connection is healthy',
        data: {
          status: states[dbState],
          collections: collections.length,
          database: mongoose.connection.name
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database connection is not healthy',
        data: {
          status: states[dbState]
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
});

export default router;