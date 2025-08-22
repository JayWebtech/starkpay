'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Search, Loader2, FileText, Wallet } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import adminService, { Transaction } from '@/services/admin';

export default function AdminSearchTransactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'reference' | 'wallet'>('reference');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);

      let response;
      if (searchType === 'reference') {
        response = await adminService.searchTransactions(searchTerm);
      } else {
        response = await adminService.searchTransactions(undefined, searchTerm);
      }
      
      setSearchResults(response.data);
    } catch (error: any) {
      console.error('Error searching transactions:', error);
      toast.error(error.response?.data?.error || 'Failed to search transactions');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Search Transactions</h1>
                <p className="text-sm text-gray-600">Search transactions by reference or wallet address</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                      placeholder={`Search by ${searchType === 'reference' ? 'reference code' : 'wallet address'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'reference' | 'wallet')}
                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="reference">Reference Code</option>
                    <option value="wallet">Wallet Address</option>
                  </select>
                  
                    <button
                    onClick={handleSearch}
                    disabled={isSearching}
                                         className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search
                      </>
                      )}
                    </button>
                  </div>
                </div>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Found {searchResults.length} transaction{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {isSearching ? (
                  <div className="text-center py-12">
                                         <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Searching transactions...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
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
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.refcode || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.wallet_address.slice(0, 8)}...{transaction.wallet_address.slice(-6)}
                                </div>
                              </div>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                              {transaction.stark_amount && (
                                <div className="text-sm text-gray-500">
                                  {transaction.stark_amount.toFixed(4)} STRK
                                </div>
                              )}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {transaction.txn_type.replace('_', ' ')}
                              </div>
                              {transaction.network && (
                                <div className="text-sm text-gray-500">
                                  {transaction.network}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                         <button className="text-primary hover:text-primary2 mr-3">
                             View
                           </button>
                              {transaction.status === 'success' && !transaction.refunded && (
                                <button className="text-red-600 hover:text-red-900">
                                  Refund
                            </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No transactions match your search criteria.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Search Tips */}
            {!hasSearched && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                                         <FileText className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Search by Reference Code</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter the transaction reference code to find specific transactions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                                         <Wallet className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Search by Wallet Address</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter a wallet address to find all transactions from that address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 