import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface AirtimeRequest {
  networkCode: string;
  phoneNumber: string;
  amount: number;
}

interface AirtimeResponse {
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

// Buy airtime
router.post('/buy', async (req: Request<{}, {}, AirtimeRequest>, res: Response): Promise<void> => {
  try {
    const { networkCode, phoneNumber, amount } = req.body;

    if (!networkCode || !phoneNumber || !amount) {
      res.status(400).json({
        status: false,
        error: 'Missing required fields: networkCode, phoneNumber, amount'
      });
      return;
    }

    const response = await axios.get<AirtimeResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIAirtimeV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          MobileNetwork: getNetworkCode(networkCode),
          MobileNumber: phoneNumber,
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
    console.error('Airtime purchase error:', error);
    res.status(500).json({
      status: false,
      message: `${error.message}. You will be refunded` || 'Error buying airtime. You will be refunded',
    });
  }
});

export default router;
