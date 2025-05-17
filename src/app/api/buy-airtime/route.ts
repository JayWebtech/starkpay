import axios from 'axios';
import { NextRequest } from 'next/server';

const getNetworkCode = (networkCode: string) => {
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
}

export async function POST(req: NextRequest): Promise<Response> {
  const { networkCode, phoneNumber, amount } = await req.json();


  try {
    const response = await axios.get(
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

    if(response.data.status == "INSUFFICIENT_BALANCE") {
      return new Response(JSON.stringify({ status: false, data: "An error occurred, you will be refunded now." }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if(response.data.status == "INVALID_RECIPIENT") {
      return new Response(JSON.stringify({ status: false, data: "Invalid recipient, you will be refunded now." }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: true, data: response.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: false,
        message: `${error.message}. You will be refunded` || 'Error buying airtime. You will be refunded',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
