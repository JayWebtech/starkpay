'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Search, Filter, Download } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import TransactionReceiptModal from '@/components/admin/TransactionReceiptModal';
import adminService, { Transaction, PaginationInfo } from '@/services/admin';
import { shortString } from 'starknet';
import * as XLSX from 'xlsx';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [refundingTransactionId, setRefundingTransactionId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!adminService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

    loadTransactions();
  }, [currentPage, router]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getTransactions(currentPage, 10);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      if (error.response?.status === 401) {
        adminService.logout();
          router.push('/admin/login');
      } else {
        toast.error('Failed to load transactions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadTransactions();
          return;
        }

    try {
      setIsLoading(true);
      const response = await adminService.searchTransactions(searchTerm);
      setTransactions(response.data);
      setPagination(null); // Search results don't have pagination
    } catch (error: any) {
      console.error('Error searching transactions:', error);
      toast.error('Failed to search transactions');
    } finally {
        setIsLoading(false);
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

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter === 'all') return true;
    return tx.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleViewTransaction = (transaction: Transaction) => {
    console.log('View button clicked for transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleRefund = async (transaction: Transaction) => {
    if (!transaction.stark_amount) {
      toast.error('Cannot refund transaction without STRK amount');
      return;
    }

    if (!transaction.refcode) {
      toast.error('Cannot refund transaction without reference code');
      return;
    }

    // Set loading state
    setRefundingTransactionId(transaction.id);

    try {
      const amountInWei = BigInt(Math.floor(transaction.stark_amount * 1e18));
      const response = await adminService.refundTransaction(
        transaction.refcode,
        Number(amountInWei),
        true // isMainnet - set to false for testnet
      );

      if (response.status) {
        toast.success('Refund processed successfully');
        loadTransactions(); // Reload transactions to update the refund status
      } else {
        toast.error(response.message || 'Failed to process refund');
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      // Clear loading state
      setRefundingTransactionId(null);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Get all transactions (not just current page)
      const response = await adminService.getTransactions(1, 10000); // Get all transactions
      const allTransactions = response.transactions;

      // Prepare data for Excel
      const excelData = allTransactions.map((tx: Transaction) => ({
        'Reference Code': tx.refcode || 'N/A',
        'Transaction Type': tx.txn_type.replace('_', ' ').toUpperCase(),
        'Amount (NGN)': tx.amount,
        'Amount (STRK)': tx.stark_amount ? Number(tx.stark_amount).toFixed(4) : 'N/A',
        'Status': tx.status.toUpperCase(),
        'Refund Status': tx.refunded ? 'REFUNDED' : 'NOT REFUNDED',
        'Wallet Address': tx.wallet_address,
        'Transaction Hash': tx.hash || 'N/A',
        'Phone Number': tx.phone_number || 'N/A',
        'Network': tx.network || 'N/A',
        'IUC Number': tx.iuc_number || 'N/A',
        'Meter Number': tx.meter_number || 'N/A',
        'Date Created': new Date(tx.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        'Date Updated': new Date(tx.updated_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Reference Code
        { wch: 20 }, // Transaction Type
        { wch: 15 }, // Amount (NGN)
        { wch: 15 }, // Amount (STRK)
        { wch: 12 }, // Status
        { wch: 15 }, // Refund Status
        { wch: 45 }, // Wallet Address
        { wch: 45 }, // Transaction Hash
        { wch: 15 }, // Phone Number
        { wch: 12 }, // Network
        { wch: 15 }, // IUC Number
        { wch: 15 }, // Meter Number
        { wch: 20 }, // Date Created
        { wch: 20 }  // Date Updated
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `transactions_${dateStr}_${timeStr}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Exported ${allTransactions.length} transactions to ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTransaction}
        isOpen={isReceiptModalOpen}
        onClose={closeReceiptModal}
      />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                <p className="text-sm text-gray-600">Manage and monitor all transactions</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by reference or wallet address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  
                  <button
                    onClick={handleSearch}
                                         className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Search
                  </button>
                  
                  <button 
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center ${
                      isExporting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                        Refund Status
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
                    {filteredTransactions.map((transaction) => (
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
                              {Number(transaction.stark_amount).toFixed(4)} STRK
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.refunded 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.refunded ? 'Refunded' : 'Not Refunded'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="text-primary hover:text-primary2 mr-3"
                          >
                            View
                          </button>
                          {transaction.status === 'failed' && !transaction.refunded && (
                            <button 
                              onClick={() => handleRefund(transaction)}
                              disabled={refundingTransactionId === transaction.id}
                              className={`flex items-center ${
                                refundingTransactionId === transaction.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                            >
                              {refundingTransactionId === transaction.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Processing...
                                </>
                              ) : (
                                'Refund'
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                                                             className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                 currentPage === page
                                   ? 'z-10 bg-purple-50 border-primary text-primary'
                                   : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                               }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                          disabled={currentPage === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTransaction}
        isOpen={isReceiptModalOpen}
        onClose={closeReceiptModal}
      />
    </div>
  );
} 