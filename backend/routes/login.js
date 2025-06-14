import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { decrypt } from '../encrypt.js';

const router = Router();

// POST /api/login
router.post('/', async (req, res) => {
  const { username, useid, requiredRole } = req.body;

  if (!username || !useid || !requiredRole) {
    return res.status(400).json({ error: 'Missing username, user ID (password), or required role' });
  }

  try {
    // Query user by username
    const userResult = await pool.query(
      'SELECT id, username, phone_no, password, wallet_address, mnemonic FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Invalid username' });
    }

    const user = userResult.rows[0];
    const phone = user.phone_no || '';
    const expectedRawPassword = user.id + phone.slice(-4);

    const isMatch = await bcrypt.compare(expectedRawPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect user ID or password' });
    }

    // Check if role is assigned
    const roleResult = await pool.query(
      `SELECT 1 FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.role_name = $2`,
      [user.id, requiredRole]
    );

    if (roleResult.rowCount === 0) {
      return res.status(403).json({ error: `Access denied. '${requiredRole}' role not assigned.` });
    }

    // Decrypt mnemonic internally
    let decryptedMnemonic = null;
    if (user.mnemonic) {
      decryptedMnemonic = decrypt(user.mnemonic);
    }

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: requiredRole,
        wallet_address: user.wallet_address,
        mnemonic: decryptedMnemonic
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
