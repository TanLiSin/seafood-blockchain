import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST: Notify end user when feedback is submitted
router.post('/notify-enduser', async (req, res) => {
  const { transaction_id, comment } = req.body;

  try {
    const txResult = await pool.query(
      'SELECT end_user, product_id FROM transactions WHERE transaction_id = $1',
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { end_user, product_id } = txResult.rows[0];

    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [end_user]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'End user not found' });
    }

    const user_id = userResult.rows[0].id;
    const message = `New feedback submitted for product ${product_id}.`;

    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [user_id, message]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in /notify-enduser:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Notify sender
router.post('/notify-sender', async (req, res) => {
  const { transaction_id, comment } = req.body;

  try {
    const tx = await pool.query(
      'SELECT user_id FROM transactions WHERE transaction_id = $1',
      [transaction_id]
    );
  
    if (tx.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
  
    const senderId = tx.rows[0].user_id;
    const shortTxId = transaction_id.length > 10 ? transaction_id.slice(0, 10) + '...' : transaction_id;
  
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [senderId, `You received feedback: "${comment}" on transaction ${shortTxId}`]
    );
  
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /notify-sender:', error);
    res.status(500).json({ error: 'Internal server error' });
  }  
});

// ✅ GET: List all notifications for a user
router.get('/notifications', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const result = await pool.query(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ PATCH: Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1',
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking notification as read:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Notify end user when a new transaction is created
router.post('/notify-transaction', async (req, res) => {
  const { transaction_id } = req.body;

  try {
    const txResult = await pool.query(
      'SELECT end_user, product_id FROM transactions WHERE transaction_id = $1',
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { end_user, product_id } = txResult.rows[0];

    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [end_user]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'End user not found' });
    }

    const user_id = userResult.rows[0].id;
    const shortTx = transaction_id.slice(0, 8) + '...';

    const message = `📦 New transaction for product ${product_id} (TX: ${shortTx})`;

    await pool.query(
      'INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW())',
      [user_id, message]
    );

    res.json({ success: true, message: 'Transaction notification sent.' });
  } catch (err) {
    console.error('❌ Error in /notify-transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
