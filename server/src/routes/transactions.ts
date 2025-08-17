import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

interface Transaction {
  amount: number;
  txn_type: string;
  wallet_address: string;
  status: string;
  timestamp: string;
  refunded?: boolean;
  phone_number?: string;
  iuc_number?: string;
  meter_number?: string;
  network?: string;
  stark_amount?: number;
  hash: string;
  refcode: string;
}

interface TransactionRequest {
  amount: number;
  txn_type: string;
  wallet_address: string;
  status: string;
  timestamp: string;
  refunded?: boolean;
  phone_number?: string;
  iuc_number?: string;
  meter_number?: string;
  network?: string;
  stark_amount?: number;
  hash: string;
  refcode: string;
}

// Store transaction
router.post('/store', async (req: Request<{}, {}, TransactionRequest>, res: Response): Promise<void> => {
  try {
    const { 
      amount, 
      txn_type, 
      wallet_address, 
      status, 
      timestamp, 
      refunded,
      phone_number,
      iuc_number,
      meter_number,
      network,
      stark_amount,
      hash,
      refcode
    } = req.body;

    // Validate required fields
    if (!amount || !txn_type || !wallet_address || !status || !timestamp || !refcode || !hash) {
      res.status(400).json({
        error: 'Missing required fields'
      });
      return;
    }

    const transaction: Transaction = {
      amount,
      txn_type,
      wallet_address,
      status,
      timestamp,
      refunded: refunded || false,
      hash,
      refcode,
      // Add optional fields if they exist
      ...(phone_number && { phone_number }),
      ...(iuc_number && { iuc_number }),
      ...(meter_number && { meter_number }),
      ...(network && { network }),
      ...(stark_amount && { stark_amount })
    };

    const result = await query(
      `INSERT INTO transactions (
        amount, txn_type, wallet_address, status, timestamp, 
        refunded, phone_number, iuc_number, meter_number, 
        network, stark_amount, hash, refcode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        transaction.amount,
        transaction.txn_type,
        transaction.wallet_address,
        transaction.status,
        transaction.timestamp,
        transaction.refunded,
        transaction.phone_number,
        transaction.iuc_number,
        transaction.meter_number,
        transaction.network,
        transaction.stark_amount,
        transaction.hash,
        transaction.refcode
      ]
    );

    res.json({ data: result.rows[0], success: true });
  } catch (error: any) {
    console.error('Error storing transaction:', error);
    res.status(500).json({
      error: `Failed to store transaction: ${error.message}`
    });
  }
});

// Get transactions
router.get('/', async (req: Request, res: Response): Promise<void> => {
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
      // If no filters, get all transactions
      queryText = 'SELECT * FROM transactions ORDER BY created_at DESC';
      params = [];
    }

    const result = await query(queryText, params);
    res.json({ data: result.rows, success: true });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions'
    });
  }
});

export default router;
