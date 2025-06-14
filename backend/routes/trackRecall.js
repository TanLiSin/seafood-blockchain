import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET transactions for distributor (distributorName as end_user)
router.get('/', async (req, res) => {
  const { distributorName } = req.query;

  if (!distributorName) {
    return res.status(400).json({ error: 'Missing distributorName' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
         s.username AS sender, s.phone_no AS sender_phone, s.email AS sender_email,
         TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
         TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users s ON t.user_id = s.id
       WHERE t.end_user = $1
       ORDER BY t.created_at DESC`,
      [distributorName]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching track & recall transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: GET transactions where the company is the sender
router.get('/transactions-company-sender', async (req, res) => {
  const { companyName } = req.query;

  if (!companyName) {
    return res.status(400).json({ error: 'Missing companyName' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
         u.username AS end_user, u.phone_no AS end_user_phone, u.email AS end_user_email,
         TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
         TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users u ON t.end_user = u.username -- get distributor info
       WHERE t.user_id = (SELECT id FROM users WHERE username = $1)
       ORDER BY t.created_at DESC`,
      [companyName]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching company sender transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: GET transactions where the company is the receiver (show sender info)
router.get('/transactions-company-receiver', async (req, res) => {
  const { companyName } = req.query;

  if (!companyName) {
    return res.status(400).json({ error: 'Missing companyName' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
         s.username AS sender, s.phone_no AS sender_phone, s.email AS sender_email,
         TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
         TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users s ON t.user_id = s.id -- get supplier info
       WHERE t.end_user = $1
       ORDER BY t.created_at DESC`,
      [companyName]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching company receiver transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET transactions for supplier (where supplier is sender)
router.get('/transactions-supplier-sender', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
         u.phone_no AS end_user_phone, u.email AS end_user_email,
         TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
         TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users u ON t.end_user = u.username -- get company info
       WHERE t.user_id = (SELECT id FROM users WHERE username = $1)
       ORDER BY t.created_at DESC`,
      [username]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching supplier-sent transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Submit feedback
router.post('/feedback', async (req, res) => {
  const { transaction_id, user_id, comment } = req.body;
  if (!transaction_id || !user_id || !comment) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    await pool.query(
      `INSERT INTO feedback (transaction_id, user_id, comment) VALUES ($1, $2, $3)`,
      [transaction_id, user_id, comment]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error inserting feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Fetch feedback for a transaction
router.get('/feedback/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  try {
    const result = await pool.query(
      `SELECT f.id, f.comment, f.created_at, f.user_id, u.username
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.transaction_id = $1
       ORDER BY f.created_at DESC`,
      [transactionId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH: Update existing feedback by ID
router.patch('/feedback/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, comment } = req.body;

  if (!comment || !user_id) {
    return res.status(400).json({ error: 'Missing user_id or comment' });
  }

  try {
    const result = await pool.query(
      `UPDATE feedback SET comment = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [comment, id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Not authorized to edit this comment or comment not found' });
    }

    res.json({ success: true, updated: result.rows[0] });
  } catch (error) {
    console.error('❌ Error updating feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Fetch all feedback
router.get('/feedback', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.comment, f.created_at, f.user_id, f.transaction_id, u.username
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching all feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
