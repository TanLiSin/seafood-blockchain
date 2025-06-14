import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET transactions (with optional userId filter)
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    const query = `
      SELECT t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
             u.phone_no AS end_user_phone, u.email AS end_user_email,
             TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
             TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
      FROM transactions t
      LEFT JOIN users u ON t.end_user = u.username
      ${userId ? 'WHERE t.user_id = $1' : ''}
      ORDER BY t.created_at DESC
    `;

    const result = userId
      ? await pool.query(query, [userId])
      : await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET a specific transaction
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
              u.phone_no AS end_user_phone, u.email AS end_user_email,
              TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
              TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users u ON t.end_user = u.username
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching transaction:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (edit) transaction
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { product_id, freshness, amount, expiry_date, end_user } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions 
       SET product_id = $1, freshness = $2, amount = $3,
           expiry_date = $4, end_user = $5
       WHERE id = $6 RETURNING *`,
      [product_id, freshness, amount, expiry_date, end_user, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json({
      message: '✅ Transaction updated successfully.',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error updating transaction:', error.message);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json({ message: '✅ Transaction deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting transaction:', error.message);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// POST a new transaction
router.post('/', async (req, res) => {
  const {
    user_id,
    product_id,
    freshness,
    amount,
    expiry_date,
    end_user,
    end_user_wallet,
  } = req.body;

  const transaction_id = 'NFIIFC' + Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    await pool.query(
      `INSERT INTO transactions (
        user_id, product_id, freshness, amount,
        expiry_date, end_user, end_user_wallet, transaction_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user_id,
        product_id,
        freshness,
        amount,
        expiry_date,
        end_user,
        end_user_wallet,
        transaction_id,
      ]
    );

    res.json({ message: '✅ Transaction created', transaction_id });
  } catch (error) {
    console.error('❌ Error inserting transaction:', error.message);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;
