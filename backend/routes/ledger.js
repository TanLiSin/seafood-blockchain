import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Supplier freshness records (from catch_records)
router.get('/supplier-freshness-records', async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT cr.* FROM catch_records cr
        JOIN users u ON cr.supplier_id = u.id
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.role_name = 'Supplier'
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching supplier freshness:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Company freshness records (from process_records)
  router.get('/company-freshness-records', async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT pr.* FROM process_records pr
        JOIN users u ON pr.company_id = u.id
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.role_name = 'Company'
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching company freshness:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // All freshness records (union of catch_records and process_records)
  router.get('/freshness-records', async (_req, res) => {
    try {
      const supplierQuery = `SELECT * FROM catch_records`;
      const companyQuery = `SELECT * FROM process_records`;
      const supplierResult = await pool.query(supplierQuery);
      const companyResult = await pool.query(companyQuery);
  
      // Combine them into one unified array
      const allFreshness = [...supplierResult.rows, ...companyResult.rows];
      res.json(allFreshness);
    } catch (error) {
      console.error('Error fetching all freshness:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });  
  
// All transactions
router.get('/transactions', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Company transactions
router.get('/company-transactions', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.* FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.role_name = 'Company'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching company transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Supplier transactions
router.get('/supplier-transactions', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.* FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.role_name = 'Supplier'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
