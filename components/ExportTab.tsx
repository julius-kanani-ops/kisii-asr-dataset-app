
import React from 'react';
import type { Stats } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ExportTabProps {
  stats: Stats;
  onDownloadCsv: () => void;
  onDownloadAudio: () => void;
  onBackupExport: () => void;
}

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className={`p-6 rounded-lg shadow-lg bg-gradient-to-br ${color} text-white`}>
        <p className="text-lg font-medium">{label}</p>
        <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
);

const ExportTab: React.FC<ExportTabProps> = ({ stats, onDownloadCsv, onDownloadAudio, onBackupExport }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Export Dataset</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Review your dataset progress below. When you have verified recordings, you can download the metadata, the audio files, or the complete dataset.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Chunks" value={stats.total} color="from-blue-500 to-blue-600" />
          <StatCard label="Recorded" value={stats.recorded} color="from-yellow-500 to-yellow-600" />
          <StatCard label="Verified" value={stats.verified} color="from-green-500 to-green-600" />
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Download Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                  onClick={onDownloadCsv}
                  disabled={stats.verified === 0}
                  className="flex items-center justify-center space-x-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Metadata (CSV)</span>
              </button>
              <button
                  onClick={onDownloadAudio}
                  disabled={stats.verified === 0}
                  className="flex items-center justify-center space-x-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Audio Files (.zip)</span>
              </button>
              <button
                  onClick={onBackupExport}
                  disabled={stats.verified === 0}
                  className="flex items-center justify-center space-x-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>Download Backup (.zip)</span>
              </button>
          </div>
          {stats.verified === 0 && <p className="text-center mt-4 text-sm text-yellow-600 dark:text-yellow-400">You need at least one verified chunk to download.</p>}
      </div>
    </div>
  );
};

export default ExportTab;
