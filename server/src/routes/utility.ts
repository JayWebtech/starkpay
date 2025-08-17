import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface UtilityRequest {
  provider: string;
  meterNumber: string;
  planId: string;
  amount: number;
}

interface UtilityResponse {
  status: string;
  [key: string]: any;
}

// Get utility plans
router.get('/plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.query;

    if (!provider) {
      res.status(400).json({
        status: false,
        error: 'Provider is required'
      });
      return;
    }

    const response = await axios.get<UtilityResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/GetUtilityPlansV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          Utility: provider,
          APIKey: process.env.NEXT_PRIVATE_KEY,
        },
      }
    );

    res.json({
      status: true,
      data: response.data
    });

  } catch (error: any) {
    console.error('Error fetching utility plans:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch utility plans'
    });
  }
});

// Pay utility
router.post('/pay', async (req: Request<{}, {}, UtilityRequest>, res: Response): Promise<void> => {
  try {
    const { provider, meterNumber, planId, amount } = req.body;

    if (!provider || !meterNumber || !planId || !amount) {
      res.status(400).json({
        status: false,
        error: 'Missing required fields: provider, meterNumber, planId, amount'
      });
      return;
    }

    const response = await axios.get<UtilityResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIUtilityV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          Utility: provider,
          MeterNumber: meterNumber,
          UtilityPlan: planId,
          Amount: amount,
          APIKey: process.env.NEXT_PRIVATE_KEY,
        },
      }
    );

    if (response.data.status === "INSUFFICIENT_BALANCE") {
      res.status(200).json({
        status: false,
        data: "An error occurred, you will be refunded now."
      });
      return;
    }

    if (response.data.status === "INVALID_RECIPIENT") {
      res.status(200).json({
        status: false,
        data: "Invalid recipient, you will be refunded now."
      });
      return;
    }

    res.json({
      status: true,
      data: response.data
    });

  } catch (error: any) {
    console.error('Utility payment error:', error);
    res.status(500).json({
      status: false,
      message: `${error.message}. You will be refunded` || 'Error paying utility. You will be refunded',
    });
  }
});

export default router;
