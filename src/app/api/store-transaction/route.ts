import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      amount, 
      txn_type, 
      wallet_address, 
      status, 
      timestamp, 
      refunded,
      // New optional fields
      phone_number,
      iuc_number,
      meter_number,
      network,
      stark_amount,
      hash,
      refcode
    } = body;

    // Validate required fields
    if (!amount || !txn_type || !wallet_address || !status || !timestamp || !refcode || !hash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction: Transaction = {
      amount,
      txn_type,
      wallet_address,
      status,
      timestamp,
      refunded: refunded || false,
      hash,
      refcode,
      // Add optional fields if they exist
      ...(phone_number && { phone_number }),
      ...(iuc_number && { iuc_number }),
      ...(meter_number && { meter_number }),
      ...(network && { network }),
      ...(stark_amount && { stark_amount })
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error storing transaction:', error);
      return NextResponse.json(
        { error: `Failed to store transaction ${error.message}` },
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