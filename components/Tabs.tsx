
import React from 'react';
import type { Tab, Stats } from '../types';
import { ChunkStatus } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  stats: Stats;
}

const Badge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  return (
    <span className="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-700 dark:text-green-200 last:mr-0 mr-1">
      {count}
    </span>
  );
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, stats }) => {
  const tabItems: { id: Tab; label: string; count?: number }[] = [
    { id: 'home', label: 'Home' },
    { id: 'text-input', label: '1. Text Input', count: stats.total },
    { id: 'recording', label: '2. Recording', count: stats.total - stats.recorded },
    { id: 'verification', label: '3. Verification', count: stats.recorded - stats.verified },
    { id: 'export', label: '4. Export', count: stats.verified },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 whitespace-nowrap py-4 px-2 sm:px-3 border-b-2 font-medium text-sm sm:text-base
              transition-colors duration-200 ease-in-out
              ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:border-green-400 dark:text-green-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && <Badge count={tab.count} />}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
