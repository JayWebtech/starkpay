'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { 
  LayoutDashboard, 
  Receipt, 
  RotateCcw, 
  DollarSign, 
  TrendingUp,
  Users,
  Loader2,
  Search
} from 'lucide-react';

type Analytics = {
  totalTransactions: number;
  totalAmount: number;
  totalProfit: number;
  averageTransactionAmount: number;
  successRate: number;
  totalUsers: number;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { supabase } = useSupabase();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: Receipt
    },
    {
      name: 'Search',
      href: '/admin/search-txn',
      icon: Search
    },
    {
      name: 'Refunds',
      href: '/admin/refunds',
      icon: RotateCcw
    }
  ];

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">StarkPay Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 