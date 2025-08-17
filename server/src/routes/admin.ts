import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticateToken, generateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
}

// Admin login
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find admin user
    const result = await query(
      'SELECT id, email, password_hash, role FROM admin_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user: AdminUser = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get admin transactions with pagination
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Fetch transactions with pagination
    const result = await query(
      `SELECT * FROM transactions 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM transactions');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get pending transactions
router.get('/pending-transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM pending_transactions 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM pending_transactions');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      pendingTransactions: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// Search transactions
router.get('/search-txn', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { reference, wallet_address } = req.query;

    let queryText = 'SELECT * FROM transactions WHERE 1=1';
    let params: any[] = [];
    let paramCount = 0;

    if (reference) {
      paramCount++;
      queryText += ` AND refcode = $${paramCount}`;
      params.push(reference);
    }

    if (wallet_address) {
      paramCount++;
      queryText += ` AND wallet_address = $${paramCount}`;
      params.push(wallet_address);
    }

    if (params.length === 0) {
      res.status(400).json({ error: 'At least one search parameter is required' });
      return;
    }

    const result = await query(queryText, params);
    res.json({ data: result.rows, success: true });
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ error: 'Failed to search transactions' });
  }
});

export default router;
