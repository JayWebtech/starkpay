import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface DataRequest {
  networkCode: string;
  phoneNumber: string;
  planId: string;
  amount: number;
}

interface DataResponse {
  status: string;
  [key: string]: any;
}

const getNetworkCode = (networkCode: string): string => {
  switch (networkCode) {
    case 'MTN':
      return '01';
    case 'Glo':
      return '02';
    case 'Airtel':
      return '04';
    case 'm_9mobile':
      return '03';
    default:
      return '01';
  }
};

// Buy data
router.post('/buy', async (req: Request<{}, {}, DataRequest>, res: Response): Promise<void> => {
  try {
    const { networkCode, phoneNumber, planId, amount } = req.body;

    if (!networkCode || !phoneNumber || !planId || !amount) {
      res.status(400).json({
        status: false,
        error: 'Missing required fields: networkCode, phoneNumber, planId, amount'
      });
      return;
    }

    const response = await axios.get<DataResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIDataV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          MobileNetwork: getNetworkCode(networkCode),
          MobileNumber: phoneNumber,
          DataPlan: planId,
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
    console.error('Data purchase error:', error);
    res.status(500).json({
      status: false,
      message: `${error.message}. You will be refunded` || 'Error buying data. You will be refunded',
    });
  }
});

// Get data plans
router.get('/plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const { networkCode } = req.query;

    if (!networkCode) {
      res.status(400).json({
        status: false,
        error: 'Network code is required'
      });
      return;
    }

    const response = await axios.get<DataResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/GetDataPlansV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          MobileNetwork: getNetworkCode(networkCode as string),
          APIKey: process.env.NEXT_PRIVATE_KEY,
        },
      }
    );

    res.json({
      status: true,
      data: response.data
    });

  } catch (error: any) {
    console.error('Error fetching data plans:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch data plans'
    });
  }
});

export default router;
