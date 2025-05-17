import axios from 'axios';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  const { electric_company_code, meter_type, meter_no, amount, phone_no } = await req.json();

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIElectricityV1.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
          APIKey: process.env.NEXT_PRIVATE_KEY,
          ElectricCompany: electric_company_code,
          MeterType: meter_type,
          MeterNo: meter_no,
          Amount: amount,
          PhoneNo: phone_no,
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
        message: `${error.message}. You will be refunded` || 'Error paying electricity bill. You will be refunded',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
