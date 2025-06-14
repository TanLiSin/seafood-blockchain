import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/catch-records
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM catch_records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching catch records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/catch-records
router.post('/', async (req, res) => {
  const {
    product_id,
    product_name,
    source,
    quantity,
    dissolved_oxygen,
    temperature,
    ph_level,
    ammonia,
    metals,
    bacteria,
    freshness_score,
    freshness_label,
    supplier_id,
    blockchain_tx_id
  } = req.body;

  try {
    await pool.query(`
      INSERT INTO catch_records (
        product_id, product_name, source, quantity,
        dissolved_oxygen, temperature, ph_level, ammonia, metals, bacteria,
        freshness_score, freshness_label, supplier_id, blockchain_tx_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    `, [
      product_id, product_name, source, quantity,
      dissolved_oxygen, temperature, ph_level, ammonia, metals, bacteria,
      freshness_score, freshness_label, supplier_id, blockchain_tx_id
    ]);

    res.status(201).json({ message: "✅ Catch record saved successfully." });
  } catch (error) {
    console.error("❌ Error inserting catch record:", error.message);
    res.status(500).json({ error: "Failed to save catch record." });
  }
});

// PUT /api/catch-records/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    source,
    quantity,
    dissolved_oxygen,
    temperature,
    ph_level,
    ammonia,
    metals,
    bacteria,
    freshness_score,
    freshness_label
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE catch_records
      SET product_name=$1, source=$2, quantity=$3,
          dissolved_oxygen=$4, temperature=$5, ph_level=$6, ammonia=$7,
          metals=$8, bacteria=$9, freshness_score=$10, freshness_label=$11
      WHERE product_id=$12
      RETURNING *
    `, [
      product_name, source, quantity,
      dissolved_oxygen, temperature, ph_level, ammonia,
      metals, bacteria, freshness_score, freshness_label, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    res.json({ message: '✅ Record updated successfully.', record: result.rows[0] });
  } catch (error) {
    console.error("❌ Error updating record:", error.message);
    res.status(500).json({ error: "Failed to update record." });
  }
});

// DELETE /api/catch-records/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM catch_records WHERE product_id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    res.json({ message: '✅ Record deleted successfully.' });
  } catch (error) {
    console.error("❌ Error deleting record:", error.message);
    res.status(500).json({ error: "Failed to delete record." });
  }
});

export default router;
