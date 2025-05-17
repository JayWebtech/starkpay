import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type Transaction = {
  id?: number;
  amount: number;
  txn_type: string;
  wallet_address: string;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  timestamp: string;
  refunded: boolean;
  created_at?: string;
  phone_number?: string;
  iuc_number?: string;
  meter_number?: string;
  network?: string;
  stark_amount?: number;
}; 