import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const distributorName = req.query.distributorName; // e.g., "Distributor A"
    if (!distributorName) {
      return res.status(400).json({ error: 'Missing distributorName' });
    }

    const { rows } = await db.query(`
      SELECT 
        pr.product_id,
        pr.product_name,
        pr.quantity,
        pr.process_method,
        pr.created_at,
        pr.source,
        pr.freshness_label
      FROM process_records pr
      JOIN transactions t ON pr.product_id = t.product_id
      WHERE t.end_user = $1
    `, [distributorName]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching distributor-linked process records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
