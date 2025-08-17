import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Get STRK price in NGN from CoinGecko
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_COINGECKO_URL}/simple/price?vs_currencies=ngn&ids=starknet`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-cg-demo-api-key': process.env.NEXT_PRIVATE_COINGECKO_KEY,
        },
      }
    );

    const data = response?.data;
    
    if (!data) {
      res.status(404).json({
        status: false,
        message: 'An error occured please try again'
      });
      return;
    }

    res.json({
      status: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching STRK price:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Error fetching rate'
    });
  }
});

export default router;
