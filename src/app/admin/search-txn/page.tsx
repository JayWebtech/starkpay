'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Search, Receipt } from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import Sidebar from '@/components/admin/Sidebar';
import type { Database } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchType, setSearchType] = useState<'wallet' | 'hash'>('wallet');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { supabase, user } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || profile?.role !== 'admin') {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/admin/login');
      }
    };

    checkAdmin();
  }, [user, router, supabase]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase.from('transactions').select('*');

      if (searchType === 'wallet') {
        query = query.ilike('wallet_address', `%${searchQuery}%`);
      } else {
        query = query.or(`hash.ilike.%${searchQuery}%,refcode.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      if (data?.length === 0) {
        toast.error('No transactions found');
      }
    } catch (error) {
      console.error('Error searching transactions:', error);
      toast.error('Failed to search transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Transaction Receipt - ${transaction.id}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-100 p-8">
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
              <div class="text-center border-b pb-4">
                <h2 class="text-2xl font-bold text-gray-900">StarkPay</h2>
                <p class="text-sm text-gray-500">Transaction Receipt</p>
              </div>
              
              <div class="mt-4 space-y-4">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Transaction ID</span>
                  <span class="text-sm font-medium">${transaction.id}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Date & Time</span>
                  <span class="text-sm font-medium">${new Date(transaction.created_at).toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Type</span>
                  <span class="text-sm font-medium">${transaction.txn_type}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Status</span>
                  <span class="text-sm font-medium">${transaction.status}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Amount (NGN)</span>
                  <span class="text-sm font-medium">₦${transaction.amount.toFixed(2)}</span>
                </div>
                ${transaction.stark_amount ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Amount (STRK)</span>
                  <span class="text-sm font-medium">${Number(transaction.stark_amount).toFixed(6)} STRK</span>
                </div>
                ` : ''}
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Wallet Address</span>
                  <span class="text-sm font-medium break-all">${transaction.wallet_address}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Txn Hash</span>
                  <span class="text-sm font-medium break-all">${transaction.hash}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Refcode</span>
                  <span class="text-sm font-medium break-all">${transaction.refcode}</span>
                </div>
                ${transaction.phone_number ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Phone Number</span>
                  <span class="text-sm font-medium">${transaction.phone_number}</span>
                </div>
                ` : ''}
                ${transaction.iuc_number ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">IUC Number</span>
                  <span class="text-sm font-medium">${transaction.iuc_number}</span>
                </div>
                ` : ''}
                ${transaction.meter_number ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Meter Number</span>
                  <span class="text-sm font-medium">${transaction.meter_number}</span>
                </div>
                ` : ''}
                ${transaction.network ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Network</span>
                  <span class="text-sm font-medium">${transaction.network}</span>
                </div>
                ` : ''}
              </div>

              <div class="mt-6 pt-4 border-t text-center">
                <p class="text-xs text-gray-500">Thank you for using StarkPay</p>
                <p class="text-xs text-gray-500 mt-1">This receipt serves as proof of your transaction</p>
              </div>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
    }
  };

  const formatId = (id: string | number) => {
    const idStr = String(id);
    return idStr.length > 8 ? `${idStr.slice(0, 8)}...` : idStr;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Transactions</h1>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Type
                    </label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as 'wallet' | 'hash')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="wallet">Wallet Address</option>
                      <option value="hash">Transaction Hash/Refcode</option>
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Query
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'wallet' ? 'Enter wallet address' : 'Enter transaction hash or refcode'}
                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {transactions.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Txn Hash
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Refcode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatId(transaction.id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₦{transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.txn_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatId(transaction.wallet_address)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatId(transaction.hash)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatId(transaction.refcode)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                              <Receipt className="h-4 w-4" />
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 