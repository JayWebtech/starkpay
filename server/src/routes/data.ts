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
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIDatabundleV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          MobileNetwork: getNetworkCode(networkCode),
          MobileNumber: phoneNumber,
          APIKey: process.env.NEXT_PRIVATE_KEY,
          DataPlan: planId,
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
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      params: error.config?.params,
      responseData: error.response?.data ? String(error.response.data).substring(0, 500) : 'No response data'
    });
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

    const networkCodeMapped = getNetworkCode(networkCode as string);
    
    console.log('Fetching data plans for network:', networkCode, '-> mapped to:', networkCodeMapped);
    console.log('API URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/APIDatabundlePlansV2.asp`);

    const response = await axios.get<DataResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIDatabundlePlansV2.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
        },
      }
    );

    console.log('Data plans response status:', response.status);
    console.log('Data plans response data keys:', Object.keys(response.data));

    const data = response.data.MOBILE_NETWORK;

    if (!data[networkCode as string]) {
      res.status(404).json({
        status: false,
        msg: 'Data network not found'
      });
      return;
    }

    res.json({
      status: true,
      data: data[networkCode as string]
    });

  } catch (error: any) {
    console.error('Error fetching data plans:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      params: error.config?.params,
      responseData: error.response?.data ? String(error.response.data).substring(0, 500) : 'No response data'
    });
    res.status(500).json({
      status: false,
      message: 'Failed to fetch data plans'
    });
  }
});

export default router;
