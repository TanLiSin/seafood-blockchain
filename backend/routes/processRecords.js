import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/process-records
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM process_records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching process records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/process-records
router.post('/', async (req, res) => {
  const {
    product_id,
    product_name,
    source,
    quantity,
    process_method,
    dissolved_oxygen,
    temperature,
    ph_level,
    ammonia,
    metals,
    bacteria,
    freshness_score,
    freshness_label,
    company_id,
    blockchain_tx_id
  } = req.body;

  try {
    await pool.query(`
      INSERT INTO process_records (
        product_id, product_name, source, quantity, process_method,
        dissolved_oxygen, temperature, ph_level, ammonia, metals, bacteria,
        freshness_score, freshness_label, company_id, blockchain_tx_id
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `, [
      product_id, product_name, source, quantity, process_method,
      dissolved_oxygen, temperature, ph_level, ammonia, metals, bacteria,
      freshness_score, freshness_label, company_id, blockchain_tx_id
    ]);

    res.status(201).json({ message: "✅ Process record saved successfully." });
  } catch (error) {
    console.error("❌ Error inserting process record:", error.message);
    res.status(500).json({ error: "Failed to save process record." });
  }
});

// PUT /api/process-records/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    product_name,
    source,
    quantity,
    process_method,
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
      UPDATE process_records
      SET product_name=$1, source=$2, quantity=$3, process_method=$4,
          dissolved_oxygen=$5, temperature=$6, ph_level=$7,
          ammonia=$8, metals=$9, bacteria=$10,
          freshness_score=$11, freshness_label=$12
      WHERE product_id=$13
      RETURNING *
    `, [
      product_name, source, quantity, process_method,
      dissolved_oxygen, temperature, ph_level,
      ammonia, metals, bacteria,
      freshness_score, freshness_label, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    res.json({ message: '✅ Process record updated successfully.', record: result.rows[0] });
  } catch (error) {
    console.error("❌ Error updating process record:", error.message);
    res.status(500).json({ error: "Failed to update process record." });
  }
});

// DELETE /api/process-records/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM process_records WHERE product_id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    res.json({ message: '✅ Process record deleted successfully.' });
  } catch (error) {
    console.error("❌ Error deleting process record:", error.message);
    res.status(500).json({ error: "Failed to delete process record." });
  }
});

export default router;
