import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET shared ledger data for distributor
router.get('/', async (req, res) => {
  const { distributorName } = req.query;

  if (!distributorName) {
    return res.status(400).json({ error: 'Missing distributorName' });
  }

  console.log('🔎 DistributorName:', distributorName);

  try {
    // Fetch freshness records linked to transactions where distributor is end_user
    const freshnessResult = await pool.query(
      `SELECT pr.*
       FROM process_records pr
       JOIN transactions t ON pr.product_id = t.product_id
       WHERE t.end_user ILIKE $1
       ORDER BY pr.created_at DESC`,
      [distributorName]
    );

    // Fetch transactions linked to this distributor as end user
    const transactionResult = await pool.query(
      `SELECT t.id, t.transaction_id, t.product_id, t.amount, t.freshness, t.end_user,
              s.username AS sender, s.phone_no AS sender_phone, s.email AS sender_email,
              TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
              TO_CHAR(t.expiry_date, 'YYYY-MM-DD') as expiry_date
       FROM transactions t
       LEFT JOIN users s ON t.user_id = s.id
       WHERE t.end_user ILIKE $1
       ORDER BY t.created_at DESC`,
      [distributorName]
    );

    res.json({
      freshnessRecords: freshnessResult.rows,
      transactions: transactionResult.rows
    });
  } catch (error) {
    console.error('❌ Error fetching shared ledger data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
