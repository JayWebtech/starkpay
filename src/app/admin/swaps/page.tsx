'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Filter, Eye, X } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import adminService, { Swap, PaginationInfo } from '@/services/admin';

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!adminService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadSwaps();
  }, [currentPage, router]);

  const loadSwaps = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getSwaps(currentPage, 10);
      console.log('Swaps response:', response); // Debug log
      setSwaps(response.swaps);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error loading swaps:', error);
      if (error.response?.status === 401) {
        adminService.logout();
        router.push('/admin/login');
      } else {
        toast.error('Failed to load swaps');
      }
    } finally {
      setIsLoading(false);
    }
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

  const formatAmount = (amount: string) => {
    try {
      // Convert string to BigInt and then to normal amount (divide by 10^18)
      const bigIntAmount = BigInt(amount);
      const normalAmount = Number(bigIntAmount) / Math.pow(10, 18);
      return normalAmount.toFixed(6); // Show 6 decimal places
    } catch (error) {
      // If conversion fails, return original amount
      return amount;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSwaps = swaps.filter(swap => {
    if (statusFilter === 'all') return true;
    return swap.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleViewSwap = (swap: Swap) => {
    setSelectedSwap(swap);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSwap(null);
  };

  if (isLoading && swaps.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading swaps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Swap Transactions</h1>
                <p className="mt-2 text-sm text-gray-600">
                  View and manage all token swap transactions
                </p>
              </div>

              {/* Filters and Actions */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination || currentPage >= pagination.pages}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>

              {/* Swaps Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From/To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Address
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
                      {filteredSwaps.map((swap) => (
                        <tr key={swap.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              {swap.id.slice(0, 8)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {swap.refcode || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatAmount(swap.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {swap.from_token} → USDC
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-500">
                              {swap.user_address.slice(0, 8)}...{swap.user_address.slice(-6)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(swap.status)}`}>
                              {swap.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(swap.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewSwap(swap)}
                              className="text-primary hover:text-primary2 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View More
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredSwaps.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Filter className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
                    <p className="text-gray-500">
                      {statusFilter === 'all' 
                        ? 'No swap transactions have been made yet.'
                        : `No swaps with status "${statusFilter}" found.`
                      }
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                      <p>Debug Info:</p>
                      <p>Total swaps: {pagination?.total || 0}</p>
                      <p>Current page: {currentPage}</p>
                      <p>Swaps loaded: {swaps.length}</p>
                    </div>
                  </div>
                )}

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
          </div>
        </main>
      </div>

      {/* Swap Details Modal */}
      {isModalOpen && selectedSwap && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Swap Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedSwap.status)}`}>
                  {selectedSwap.status.toUpperCase()}
                </span>
              </div>

              {/* Swap Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Swap Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Swap ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedSwap.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reference Code</label>
                      <p className="text-sm text-gray-900">{selectedSwap.refcode || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-lg font-semibold text-gray-900">{formatAmount(selectedSwap.amount)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Token Conversion</label>
                      <p className="text-sm text-gray-900">{selectedSwap.from_token} → {selectedSwap.to_token}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedSwap.created_at)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Updated At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedSwap.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User & Transaction Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">User Address</label>
                      <p className="text-sm text-gray-900 font-mono break-all">{selectedSwap.user_address}</p>
                    </div>

                    {selectedSwap.result && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Transaction Result</label>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="text-xs text-gray-700 overflow-x-auto">
                            {JSON.stringify(selectedSwap.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {selectedSwap.error && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Error Message</label>
                        <div className="bg-red-50 p-3 rounded-md">
                          <p className="text-sm text-red-700">{selectedSwap.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
