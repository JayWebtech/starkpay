'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { Loader2, Receipt, DollarSign, TrendingUp, Users } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';

type Analytics = {
  totalTransactions: number;
  totalAmount: number;
  totalProfit: number;
  averageTransactionAmount: number;
  successRate: number;
  totalUsers: number;
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const router = useRouter();
  const { supabase, user } = useSupabase();

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

        // Fetch analytics after confirming admin status
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*');

        if (txError) throw txError;

        // Calculate analytics
        const totalTransactions = transactions.length;
        const totalAmount = transactions.filter(tx => tx.status === 'success').reduce((sum, tx) => sum + tx.amount, 0);
        const totalProfit = transactions.filter(tx => tx.status === 'success').reduce((sum, tx) => sum + (tx.amount * 0.05), 0);
        const averageTransactionAmount = totalAmount / (totalTransactions || 1);
        const successRate = (transactions.filter(tx => tx.status === 'success').length / (totalTransactions || 1)) * 100;
        const uniqueUsers = new Set(transactions.map(tx => tx.user_email).filter(Boolean)).size;

        setAnalytics({
          totalTransactions,
          totalAmount,
          totalProfit,
          averageTransactionAmount,
          successRate,
          totalUsers: uniqueUsers
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/login');
      }
    };

    checkAdmin();
  }, [user, router, supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    toast.success('Signed out successfully');
                    router.push('/admin/login');
                  } catch (error) {
                    console.error('Error signing out:', error);
                    toast.error('Failed to sign out');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Total Transactions</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics?.totalTransactions}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics ? formatCurrency(analytics.totalAmount) : '-'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Total Profit</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics ? formatCurrency(analytics.totalProfit) : '-'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics ? `${analytics.successRate.toFixed(1)}%` : '-'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">Average Transaction</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {analytics ? formatCurrency(analytics.averageTransactionAmount) : '-'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 