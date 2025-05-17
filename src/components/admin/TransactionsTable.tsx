'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { Database } from '@/types/supabase';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Transaction = Database['public']['Tables']['transactions']['Row'];

const formatId = (id: string | number) => {
  const idStr = String(id);
  return idStr.length > 8 ? `${idStr.slice(0, 8)}...` : idStr;
};

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { supabase } = useSupabase();
  const ITEMS_PER_PAGE = 10;

  const fetchTransactions = async (pageNum: number) => {
    try {
      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      if (pageNum === 1) {
        setTransactions(data);
      } else {
        setTransactions((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No transactions found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (NGN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (STRK)
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
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IUC Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meter Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Network
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
                    {transaction.stark_amount ? 
                      `${Number(transaction.stark_amount).toFixed(6)} STRK` : 
                      'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.txn_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        transaction.status
                      )}`}
                    >
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
                    {transaction.phone_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.iuc_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.meter_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.network || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
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
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

    
    </>
  );
} 