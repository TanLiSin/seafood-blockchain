import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const companyName = req.query.companyName; // e.g., "Company A"
    if (!companyName) {
      return res.status(400).json({ error: 'Missing companyName' });
    }

    const { rows } = await db.query(`
      SELECT 
        cr.product_id,
        cr.product_name,
        cr.quantity,
        cr.created_at,
        cr.source,
        cr.freshness_label
      FROM catch_records cr
      JOIN transactions t ON cr.product_id = t.product_id
      WHERE t.end_user = $1
    `, [companyName]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching company-linked catch records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
