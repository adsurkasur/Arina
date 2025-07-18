import express from 'express';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js'; // Add .js extension

const router = express.Router();

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        displayName?: string;
        phoneNumber?: string;
      };
    }
  }
}

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

// Create payment transaction
router.post('/create-transaction', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { planId, planName, price, billingPeriod } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate unique order ID
    const orderId = `ARINA-${planId.toUpperCase()}-${Date.now()}-${userId.slice(-6)}`;

    // Prepare transaction details
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      credit_card: {
        secure: true,
      },
      item_details: [
        {
          id: planId,
          price: price,
          quantity: 1,
          name: `${planName} - ${billingPeriod}`,
          category: 'Subscription',
        },
      ],
      customer_details: {
        first_name: req.user?.displayName || 'User',
        email: req.user?.email,
        phone: req.user?.phoneNumber || '',
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/callback?payment=success`,
        error: `${process.env.FRONTEND_URL}/payment/callback?payment=error`,
        pending: `${process.env.FRONTEND_URL}/payment/callback?payment=pending`,
      },
    };

    // Create Midtrans transaction
    const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify(transactionDetails),
    });

    const midtransResponse = await response.json();

    if (!response.ok) {
      throw new Error(midtransResponse.error_messages?.[0] || 'Failed to create transaction');
    }

    // Store transaction in database (implement based on your database structure)
    // await storeTransaction({
    //   orderId,
    //   userId,
    //   planId,
    //   amount: price,
    //   status: 'pending',
    //   billingPeriod,
    // });

    res.json({
      token: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
      orderId,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Verify payment status
router.post('/verify-payment', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { orderId, transactionStatus, planId } = req.body;
    const userId = req.user?.uid;

    // Verify transaction with Midtrans
    const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    const statusUrl = MIDTRANS_IS_PRODUCTION
      ? `https://api.midtrans.com/v2/${orderId}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    const transactionData = await response.json();

    if (transactionData.transaction_status === 'settlement' || transactionData.transaction_status === 'capture') {
      // Payment successful - update user subscription
      // Implement based on your database structure
      // await updateUserSubscription(userId, planId);
      
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Verification failed' 
    });
  }
});

// Get payment status
router.get('/status/:orderId', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const { orderId } = req.params;
    
    // Query Midtrans for transaction status
    const authHeader = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    const statusUrl = MIDTRANS_IS_PRODUCTION
      ? `https://api.midtrans.com/v2/${orderId}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    const transactionData = await response.json();
    res.json(transactionData);

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Midtrans webhook/notification handler
router.post('/notification', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
  try {
    const notification = JSON.parse(req.body.toString());
    
    // Verify signature
    const signature = crypto
      .createHash('sha512')
      .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (signature !== notification.signature_key) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const { order_id, transaction_status, fraud_status } = notification;

    // Handle different transaction statuses
    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          // Payment successful
          console.log(`Payment ${order_id} captured successfully`);
          // Update subscription status
        }
        break;
      case 'settlement':
        // Payment completed
        console.log(`Payment ${order_id} settled`);
        // Update subscription status
        break;
      case 'pending':
        // Payment pending
        console.log(`Payment ${order_id} is pending`);
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        // Payment failed/cancelled
        console.log(`Payment ${order_id} ${transaction_status}`);
        // Update transaction status
        break;
    }

    res.json({ status: 'OK' });

  } catch (error) {
    console.error('Notification handling error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;