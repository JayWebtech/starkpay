import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { AutoSwappr, TOKEN_ADDRESSES } from 'autoswap-sdk';

const router = express.Router();

interface SwapRequest {
  amount: string;
  fromToken: string;
  toToken: string;
  userAddress: string;
  refcode?: string;
}

interface SwapJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: string;
  fromToken: string;
  toToken: string;
  userAddress: string;
  refcode?: string;
  result?: any;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

// In-memory queue for swap jobs (in production, use Redis or a proper job queue)
const swapQueue: SwapJob[] = [];
let isProcessing = false;

// Process swap jobs in background
async function processSwapQueue() {
  if (isProcessing || swapQueue.length === 0) return;
  
  isProcessing = true;
  
  while (swapQueue.length > 0) {
    const job = swapQueue.shift();
    if (!job) continue;
    
    try {
      // Update job status to processing
      await updateSwapJobStatus(job.id, 'processing');
      
      // Initialize the SDK
      const autoswappr = new AutoSwappr({
        contractAddress: process.env.AUTOSWAPPR_CONTRACT_ADDRESS!,
        rpcUrl: process.env.NEXT_PUBLIC_MAINET_RPC!,
        accountAddress: process.env.NEXT_PRIVATE_STARKPAY_ACCOUNT_ADDRESS!,
        privateKey: process.env.NEXT_PRIVATE_STARKPAY_PRIVATE_KEY!,
      });

      // Execute swap
      const result = await autoswappr.executeSwap(
        job.fromToken as any,
        job.toToken as any,
        {
          amount: job.amount,
          isToken1: false,
        }
      );

      console.log('Swap result:', result);
      
      // Update job as completed
      await updateSwapJobStatus(job.id, 'completed', result);
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      await updateSwapJobStatus(job.id, 'failed', null, error.message);
    }
  }
  
  isProcessing = false;
}

// Update swap job status in database
async function updateSwapJobStatus(id: string, status: string, result?: any, error?: string) {
  try {
    await query(
      `UPDATE swap_jobs 
       SET status = $1, result = $2, error = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [status, result ? JSON.stringify(result) : null, error, id]
    );
  } catch (err) {
    console.error('Error updating swap job:', err);
  }
}

// Initialize swap jobs table
async function initSwapJobsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS swap_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        amount VARCHAR(255) NOT NULL,
        from_token VARCHAR(255) NOT NULL,
        to_token VARCHAR(255) NOT NULL,
        user_address VARCHAR(255) NOT NULL,
        refcode VARCHAR(255),
        result JSONB,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error creating swap_jobs table:', error);
  }
}

// Initialize table on module load
initSwapJobsTable();

// Submit swap request (async)
router.post('/submit', async (req: Request<{}, {}, SwapRequest>, res: Response): Promise<void> => {
  try {
    const { amount, fromToken, toToken, userAddress, refcode } = req.body;

    if (!amount || !fromToken || !toToken || !userAddress) {
      res.status(400).json({
        status: false,
        message: 'Missing required fields: amount, fromToken, toToken, userAddress'
      });
      return;
    }

    // Create swap job in database
    const result = await query(
      `INSERT INTO swap_jobs (amount, from_token, to_token, user_address, refcode, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING id`,
      [amount, fromToken, toToken, userAddress, refcode]
    );

    const jobId = result.rows[0].id;

    // Add to processing queue
    const job: SwapJob = {
      id: jobId,
      status: 'pending',
      amount,
      fromToken,
      toToken,
      userAddress,
      refcode,
      created_at: new Date(),
      updated_at: new Date()
    };

    swapQueue.push(job);

    // Start processing if not already running
    if (!isProcessing) {
      processSwapQueue();
    }

    res.json({
      status: true,
      message: 'Swap request submitted successfully',
      jobId,
      jobStatus: 'pending'
    });

  } catch (error: any) {
    console.error('Error submitting swap:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to submit swap request'
    });
  }
});

// Check swap status
router.get('/status/:jobId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const result = await query(
      'SELECT * FROM swap_jobs WHERE id = $1',
      [jobId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: false,
        message: 'Swap job not found'
      });
      return;
    }

    const job = result.rows[0];

    res.json({
      status: true,
      data: {
        id: job.id,
        status: job.status,
        amount: job.amount,
        fromToken: job.from_token,
        toToken: job.to_token,
        userAddress: job.user_address,
        refcode: job.refcode,
        result: job.result,
        error: job.error,
        created_at: job.created_at,
        updated_at: job.updated_at
      }
    });

  } catch (error: any) {
    console.error('Error checking swap status:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to check swap status'
    });
  }
});

// Get all swap jobs for a user
router.get('/user/:userAddress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userAddress } = req.params;

    const result = await query(
      'SELECT * FROM swap_jobs WHERE user_address = $1 ORDER BY created_at DESC',
      [userAddress]
    );

    res.json({
      status: true,
      data: result.rows.map(job => ({
        id: job.id,
        status: job.status,
        amount: job.amount,
        fromToken: job.from_token,
        toToken: job.to_token,
        userAddress: job.user_address,
        refcode: job.refcode,
        result: job.result,
        error: job.error,
        created_at: job.created_at,
        updated_at: job.updated_at
      }))
    });

  } catch (error: any) {
    console.error('Error fetching user swaps:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch user swaps'
    });
  }
});

export default router;
