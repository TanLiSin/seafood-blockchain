import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          u.id AS user_id,
          u.username,
          u.wallet_address,
          r.role_name
      FROM 
          user_roles ur
      JOIN 
          users u ON ur.user_id = u.id
      JOIN 
          roles r ON ur.role_id = r.id
      WHERE 
          r.role_name = 'Distributor'
      ORDER BY 
          u.username ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching company users:", error.message);
    res.status(500).json({ error: "Failed to fetch company users." });
  }
});

export default router;
