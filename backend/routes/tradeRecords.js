import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';

const router = Router();

// 🟡 Multer storage for uploaded certificates
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/company-certificates/');
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 🟡 POST endpoint to upload certificate
router.post('/upload-certificate', upload.single('license'), async (req, res) => {
  const { userId } = req.body;

  if (!req.file || !userId) {
    return res.status(400).send('Missing file or user ID.');
  }

  const filePath = req.file.filename;
  try {
    await pool.query('UPDATE users SET license = $1 WHERE id = $2', [filePath, userId]);
    res.status(200).send('Certificate uploaded and license updated.');
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).send('Error updating user license.');
  }
});

// 🟡 GET endpoint for regulatory to view all company certificates only
router.get('/company-certificates', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.username AS company_name,
        u.phone_no AS company_phone,
        u.email AS company_email,
        u.license
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.role_name = 'Company' AND u.license IS NOT NULL
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching company certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
