import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface CableRequest {
  provider: string;
  iucNumber: string;
  planId: string;
  amount: number;
  phoneNumber: string;
}

interface CableResponse {
  status: string;
  [key: string]: any;
}

// Get cable plans
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

    // Map provider names to API format
    const getProviderCode = (providerName: string): string => {
      switch (providerName.toLowerCase()) {
        case 'dstv':
          return 'DSTV';
        case 'gotv':
          return 'GOTV';
        case 'startimes':
          return 'STARTIMES';
        case 'showmax':
          return 'SHOWMAX';
        default:
          return providerName.toUpperCase();
      }
    };

    const providerCode = getProviderCode(provider as string);
    
    console.log('Fetching cable plans for provider:', providerCode);
    console.log('API URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/GetCablePlansV1.asp`);

    const response = await axios.get<CableResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APICableTVPackagesV2.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
        },
      }
    );

    console.log('Cable plans response status:', response.status);
    console.log('Cable plans response data keys:', Object.keys(response.data));

    const tvData = response.data?.TV_ID;
    
    if (!tvData) {
      res.status(404).json({
        status: false,
        msg: 'No cable TV data found'
      });
      return;
    }

    // Find the specific provider's data
    const providerData = tvData[providerCode];
    
    if (!providerData || !providerData[0] || !providerData[0].PRODUCT) {
      res.status(404).json({
        status: false,
        msg: `No plans found for provider: ${provider}`
      });
      return;
    }

    // Return the PRODUCT array which contains the plans
    res.json({
      status: true,
      data: providerData[0].PRODUCT
    });

  } catch (error: any) {
    console.error('Error fetching cable plans:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      params: error.config?.params
    });
    res.status(500).json({
      status: false,
      message: 'Failed to fetch cable plans'
    });
  }
});

// Pay cable TV
router.post('/pay', async (req: Request<{}, {}, CableRequest>, res: Response): Promise<void> => {
  try {
    const { provider, iucNumber, planId, amount, phoneNumber } = req.body;

    if (!provider || !iucNumber || !planId || !amount) {
      res.status(400).json({
        status: false,
        error: 'Missing required fields: provider, iucNumber, planId, amount'
      });
      return;
    }

    // Map provider names to API format
    const getProviderCode = (providerName: string): string => {
      switch (providerName.toLowerCase()) {
        case 'dstv':
          return 'DSTV';
        case 'gotv':
          return 'GOTV';
        case 'startimes':
          return 'STARTIMES';
        case 'showmax':
          return 'SHOWMAX';
        default:
          return providerName.toUpperCase();
      }
    };

    const providerCode = getProviderCode(provider);

    const response = await axios.get<CableResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APICableTVV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          APIKey: process.env.NEXT_PRIVATE_KEY,
          CableTV: providerCode,
          Package: planId,
          SmartCardNo: iucNumber,
          PhoneNo: phoneNumber,
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
    console.error('Cable TV payment error:', error);
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
      message: `${error.message}. You will be refunded` || 'Error paying cable TV. You will be refunded',
    });
  }
});

export default router;
