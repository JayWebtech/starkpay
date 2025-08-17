import express, { Request, Response } from 'express';
import { query } from '../config/database';
import { RpcProvider, shortString, constants, RPC, Call } from 'starknet';
import { Account } from 'starknet';

const router = express.Router();

interface RefundRequest {
  isMainet: boolean;
  refcode: string;
  amountInSTRK: string;
}

interface TokenOption {
  symbol: string;
  address: string;
  decimals: number;
}

// Get supported tokens and contract addresses (matching src/constants/token.ts)
const MAINNET_SUPPORTED_TOKENS = Object.freeze({
  STRK: {
    symbol: 'STRK',
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    decimals: 18,
  },
}) as Readonly<Record<string, Readonly<TokenOption>>>;

const TESTNET_SUPPORTED_TOKENS = Object.freeze({
  STRK: {
    symbol: 'STRK',
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    decimals: 18,
  },
}) as Readonly<Record<string, Readonly<TokenOption>>>;

const TESTNET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS;
const MAINNET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS;

const getContractAddress = (isMainnet: boolean) =>
  isMainnet ? MAINNET_CONTRACT_ADDRESS : TESTNET_CONTRACT_ADDRESS;

const getSupportedTokens = (isMainnet: boolean) =>
  isMainnet ? MAINNET_SUPPORTED_TOKENS : TESTNET_SUPPORTED_TOKENS;

// Process refund (main endpoint)
router.post(
  '/process',
  async (req: Request<{}, {}, RefundRequest>, res: Response): Promise<void> => {
    console.log('🔍 Refund process endpoint called'); // Debug log

    let isMainet: boolean;
    let refcode: string;
    let amountInSTRK: string | number;
    let SUPPORTED_TOKENS: any;
    let CONTRACT_ADDRESS: string | undefined;

    try {
      const body = req.body;
      console.log('Request body:', body); // Debug log

      isMainet = body.isMainet;
      refcode = body.refcode;
      amountInSTRK = body.amountInSTRK;

      console.log('Parsed values:', { isMainet, refcode, amountInSTRK }); // Debug log

      if (typeof isMainet !== 'boolean' || typeof refcode !== 'string') {
        console.log('Validation failed:', {
          isMainetType: typeof isMainet,
          refcodeType: typeof refcode,
        }); // Debug log
        res.status(400).json({
          status: false,
          message: 'Invalid request parameters',
        });
        return;
      }

      // Convert amountInSTRK to string if it's a number
      if (typeof amountInSTRK === 'number') {
        amountInSTRK = (amountInSTRK as number).toString();
      }

      SUPPORTED_TOKENS = getSupportedTokens(isMainet);
      CONTRACT_ADDRESS = getContractAddress(isMainet);
    } catch (error: any) {
      console.error('❌ Error parsing request:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(400).json({
        status: false,
        message: `Error parsing request: ${error.message}`,
      });
      return;
    }

    try {
      // Check transaction status before proceeding
      const transactionResult = await query('SELECT * FROM transactions WHERE refcode = $1', [
        refcode,
      ]);

      if (transactionResult.rows.length === 0) {
        res.status(500).json({
          status: false,
          message: 'Transaction not found',
        });
        return;
      }

      const transaction = transactionResult.rows[0];

      if (transaction.refunded) {
        res.status(500).json({
          status: false,
          message: 'Transaction already refunded',
        });
        return;
      }

      if (transaction.status !== 'failed') {
        res.status(500).json({
          status: false,
          message: 'Only failed transactions can be refunded',
        });
        return;
      }

      const provider = new RpcProvider({
        nodeUrl: `${isMainet ? process.env.NEXT_PUBLIC_MAINET_RPC : process.env.NEXT_PUBLIC_SEPOLIA_RPC}`,
      });

      console.log('Checking environment variables...');
      const privateKey = process.env.NEXT_PRIVATE_STARKPAY_PRIVATE_KEY;
      const accountAddress = process.env.NEXT_PRIVATE_STARKPAY_ACCOUNT_ADDRESS;

      if (!privateKey || !accountAddress) {
        res.status(500).json({
          status: false,
          message: 'An expected error occurred, please try again later',
        });
        return;
      }

      try {
        console.log('Creating account...');
        const account0 = new Account(
          provider,
          accountAddress,
          privateKey,
          undefined,
          constants.TRANSACTION_VERSION.V3,
        );

        const amount = BigInt(amountInSTRK || 0);
        const low = amount & BigInt('0xffffffffffffffffffffffffffffffff');
        const high = amount >> BigInt(128);

        const calls: Call[] = [
          {
            entrypoint: 'approve',
            contractAddress: SUPPORTED_TOKENS.STRK.address,
            calldata: [CONTRACT_ADDRESS as `0x${string}`, low.toString(), high.toString()],
          },
          {
            entrypoint: 'refund',
            contractAddress: CONTRACT_ADDRESS as `0x${string}`,
            calldata: [shortString.encodeShortString(refcode)],
          },
        ];

        const maxQtyGasAuthorized = 1800n;
        const maxPriceAuthorizeForOneGas = 20n * 10n ** 12n;
        console.log(
          'max authorized cost =',
          maxQtyGasAuthorized * maxPriceAuthorizeForOneGas,
          'FRI'
        );

        const { suggestedMaxFee, resourceBounds } = await account0.estimateFee(calls, { version: 3 });

        const { transaction_hash: txH } = await account0.execute(calls, {
          version: 3,
          resourceBounds,
        });


        // const { transaction_hash: txH } = await account0.execute(calls, {
        //   tip: 1000n,
        //   version: 3,
        //   maxFee: 14 ** 18,
        //   feeDataAvailabilityMode: RPC.EDataAvailabilityMode.L1,
        //   //tip: 10 ** 13,
        //   resourceBounds: {
        //     l2_gas: { max_amount: '0x3beb240', max_price_per_unit: '0x22ecb25c00' },
        //     l1_gas: { max_amount: '0x0', max_price_per_unit: '0x22ecb25c00' },
        //     l1_data_gas: { max_amount: '0x120', max_price_per_unit: '0x22ecb25c00' },
        //   },
        // });

        const txR = await provider.waitForTransaction(txH);

        if (txR.isSuccess()) {
          const updateResult = await query(
            'UPDATE transactions SET refunded = true, status = $1 WHERE refcode = $2',
            ['failed', refcode]
          );

          console.log('Transaction updated:', updateResult);

          res.json({
            status: true,
            message: 'Refund triggered successfully',
          });
          return;
        }

        res.status(500).json({
          status: false,
          message: 'Refund failed. Our team will be notified',
        });
      } catch (error: any) {
        console.error('Detailed error:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        let userMessage = 'Error while refunding, our team will be notified';

        if (error.message && error.message.includes('Invalid reference code')) {
          userMessage = 'Invalid reference code';
        }
        if (error.message && error.message.includes('Transaction already refunded')) {
          userMessage = 'Transaction already refunded';
        }
        if (error.message && error.message.includes('Unauthorized caller')) {
          userMessage = 'Unauthorized caller';
        }

        res.status(500).json({
          status: false,
          message: userMessage,
        });
      }
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      let userMessage = 'Error while refunding, our team will be notified';

      if (error.message && error.message.includes('Invalid reference code')) {
        userMessage = 'Invalid reference code';
      }

      res.status(500).json({
        status: false,
        message: userMessage,
      });
    }
  }
);

// Create refund record (admin endpoint)
router.post(
  '/',
  async (
    req: Request<{}, {}, { transaction_id: string; amount: number; reason: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { transaction_id, amount, reason } = req.body;

      if (!transaction_id || !amount || !reason) {
        res.status(400).json({
          error: 'Missing required fields: transaction_id, amount, reason',
        });
        return;
      }

      // Verify transaction exists
      const transactionResult = await query('SELECT id, amount FROM transactions WHERE id = $1', [
        transaction_id,
      ]);

      if (transactionResult.rows.length === 0) {
        res.status(404).json({
          error: 'Transaction not found',
        });
        return;
      }

      const transaction = transactionResult.rows[0];

      // Check if refund amount is valid
      if (amount > transaction.amount) {
        res.status(400).json({
          error: 'Refund amount cannot exceed transaction amount',
        });
        return;
      }

      // Create refund record
      const result = await query(
        `INSERT INTO refunds (transaction_id, amount, reason, status) 
       VALUES ($1, $2, $3, 'pending') 
       RETURNING *`,
        [transaction_id, amount, reason]
      );

      // Update transaction as refunded
      await query('UPDATE transactions SET refunded = true WHERE id = $1', [transaction_id]);

      res.json({
        data: result.rows[0],
        success: true,
        message: 'Refund created successfully',
      });
    } catch (error: any) {
      console.error('Error creating refund:', error);
      res.status(500).json({
        error: `Failed to create refund: ${error.message}`,
      });
    }
  }
);

// Get all refunds
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT r.*, t.txn_type, t.wallet_address 
       FROM refunds r 
       JOIN transactions t ON r.transaction_id = t.id 
       ORDER BY r.created_at DESC`
    );

    res.json({
      data: result.rows,
      success: true,
    });
  } catch (error: any) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({
      error: 'Failed to fetch refunds',
    });
  }
});

// Process refund status (admin endpoint)
router.put('/:id/process', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'processed'].includes(status)) {
      res.status(400).json({
        error: 'Invalid status. Must be approved, rejected, or processed',
      });
      return;
    }

    const result = await query(
      `UPDATE refunds 
       SET status = $1, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Refund not found',
      });
      return;
    }

    res.json({
      data: result.rows[0],
      success: true,
      message: `Refund ${status} successfully`,
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      error: `Failed to process refund: ${error.message}`,
    });
  }
});

export default router;
