import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

interface PendingTransactionRequest {
  amount: number;
  txn_type: string;
  wallet_address: string;
  status?: string;
  phone_number?: string;
  iuc_number?: string;
  meter_number?: string;
  network?: string;
  stark_amount?: number;
  hash: string;
  refcode: string;
}

// Store pending transaction
router.post('/store', async (req: Request<{}, {}, PendingTransactionRequest>, res: Response): Promise<void> => {
  try {
    const { 
      amount, 
      txn_type, 
      wallet_address, 
      status = 'pending',
      phone_number,
      iuc_number,
      meter_number,
      network,
      stark_amount,
      hash,
      refcode
    } = req.body;

    // Validate required fields
    if (!amount || !txn_type || !wallet_address || !hash || !refcode) {
      res.status(400).json({
        error: 'Missing required fields: amount, txn_type, wallet_address, hash, refcode'
      });
      return;
    }

    const result = await query(
      `INSERT INTO pending_transactions (
        amount, txn_type, wallet_address, status, 
        phone_number, iuc_number, meter_number, 
        network, stark_amount, hash, refcode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        amount,
        txn_type,
        wallet_address,
        status,
        phone_number,
        iuc_number,
        meter_number,
        network,
        stark_amount,
        hash,
        refcode
      ]
    );

    res.json({ data: result.rows[0], success: true });
  } catch (error: any) {
    console.error('Error storing pending transaction:', error);
    res.status(500).json({
      error: `Failed to store pending transaction: ${error.message}`
    });
  }
});

// Update pending transaction by refcode
router.put('/:refcode/update', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refcode } = req.params;
    const { status, ...updateFields } = req.body;

    if (!status) {
      res.status(400).json({
        error: 'Status is required'
      });
      return;
    }

    // Build dynamic update query
    const fields = Object.keys(updateFields);
    let queryText: string;
    let params: any[];

    if (fields.length === 0) {
      // Only update status
      queryText = `UPDATE pending_transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE refcode = $2 RETURNING *`;
      params = [status, refcode];
    } else {
      // Update status and other fields
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      queryText = `UPDATE pending_transactions SET ${setClause}, status = $1, updated_at = CURRENT_TIMESTAMP WHERE refcode = $${fields.length + 2} RETURNING *`;
      params = [status, ...fields.map(field => updateFields[field]), refcode];
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Pending transaction not found'
      });
      return;
    }

    res.json({
      data: result.rows[0],
      success: true,
      message: 'Pending transaction updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating pending transaction:', error);
    res.status(500).json({
      error: `Failed to update pending transaction: ${error.message}`
    });
  }
});

// Get pending transactions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet_address, status } = req.query;

    let queryText = 'SELECT * FROM pending_transactions WHERE 1=1';
    let params: any[] = [];
    let paramCount = 0;

    if (wallet_address) {
      paramCount++;
      queryText += ` AND wallet_address = $${paramCount}`;
      params.push(wallet_address);
    }

    if (status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    res.json({
      data: result.rows,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching pending transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch pending transactions'
    });
  }
});

export default router;
