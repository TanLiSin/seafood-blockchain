import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';
import { encrypt } from '../encrypt.js';
import bcrypt from 'bcrypt';

const router = Router();

// Setup Multer to store PDFs in 'uploads/' with original filename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

// GET all users
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        users.*, 
        roles.role_name AS role
      FROM users
      LEFT JOIN user_roles ON users.id = user_roles.user_id
      LEFT JOIN roles ON user_roles.role_id = roles.id
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create or update user with file upload, encrypted mnemonic, and hashed password
router.post('/', upload.single('license'), async (req, res) => {
  const {
    id, username, email, wallet_address, phone_no, role, mnemonic
  } = req.body;

  const licenseFilename = req.file ? req.file.filename : null;
  const encryptedMnemonic = mnemonic ? encrypt(mnemonic) : null;
  const rawPassword = id + (phone_no || '').slice(-4);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const upsertUserQuery = `
      INSERT INTO users (id, username, email, wallet_address, phone_no, license, mnemonic, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id)
      DO UPDATE SET
        username = $2,
        email = $3,
        wallet_address = $4,
        phone_no = $5,
        license = COALESCE($6, users.license),
        mnemonic = COALESCE($7, users.mnemonic),
        password = $8
    `;
    await client.query(upsertUserQuery, [
      id,
      username,
      email,
      wallet_address,
      phone_no,
      licenseFilename,
      encryptedMnemonic,
      hashedPassword
    ]);

    const roleResult = await client.query(
      'SELECT id FROM roles WHERE role_name = $1',
      [role]
    );

    if (roleResult.rows.length === 0) {
      throw new Error(`Role "${role}" not found in roles table.`);
    }

    const roleId = roleResult.rows[0].id;

    await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [id, roleId]);

    await client.query('COMMIT');
    res.status(200).json({ message: 'User and role added or updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ POST /users error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE /users error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(`
      SELECT 
        users.*, 
        roles.role_name AS role
      FROM users
      LEFT JOIN user_roles ON users.id = user_roles.user_id
      LEFT JOIN roles ON user_roles.role_id = roles.id
      WHERE users.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
