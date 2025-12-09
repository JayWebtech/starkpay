'use client';
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Tab configuration
 */
export interface Tab {
  name: string;
  id: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsLoading?: (loading: boolean) => void;
  isLoading?: boolean;
  onTabChange?: (tabId: string) => void;
}

/**
 * Tabs Component
 * Navigation tabs for different payment types
 * Features animated underline indicator and hover effects
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  setIsLoading,
  isLoading,
  onTabChange,
}) => {
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (setIsLoading) setIsLoading(false);
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className={`
      glass-card p-2 
      ${isLoading ? 'rounded-t-2xl' : 'rounded-2xl'}
    `}>
      <div className="flex justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2
                py-3 px-2 sm:px-4
                text-xs sm:text-sm font-medium
                rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
                }
              `}
            >
              {/* Icon and Label */}
              <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className={`transition-colors ${isActive ? 'text-primary' : ''}`}>
                  {tab.icon}
                </span>
                <span>{tab.name}</span>
              </span>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId={tabs[0].id + "activeTab"}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-[#00A8E8] rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
