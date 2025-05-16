import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      amount, 
      txnType, 
      walletAddress, 
      status, 
      reference, 
      timestamp, 
      refunded,
      // New optional fields
      phoneNumber,
      iucNumber,
      meterNumber,
      network
    } = body;

    // Validate required fields
    if (!amount || !txnType || !walletAddress || !status || !reference || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction: Transaction = {
      amount,
      txn_type: txnType,
      wallet_address: walletAddress,
      status,
      reference,
      timestamp,
      refunded: refunded || false,
      // Add optional fields if they exist
      ...(phoneNumber && { phone_number: phoneNumber }),
      ...(iucNumber && { iuc_number: iucNumber }),
      ...(meterNumber && { meter_number: meterNumber }),
      ...(network && { network: network })
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error storing transaction:', error);
      return NextResponse.json(
        { error: 'Failed to store transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in store-transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const walletAddress = searchParams.get('wallet_address');

    let query = supabase.from('transactions').select('*');

    if (reference) {
      query = query.eq('reference', reference);
    }

    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error in store-transaction GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 