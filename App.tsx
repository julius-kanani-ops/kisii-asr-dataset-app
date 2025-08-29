
import React, { useState, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import JSZip from 'jszip';
import type { Chunk, Tab } from './types';
import { ChunkStatus } from './types';
import Tabs from './components/Tabs';
import TextInputTab from './components/TextInputTab';
import RecordingTab from './components/RecordingTab';
import VerificationTab from './components/VerificationTab';
import ExportTab from './components/ExportTab';
import { EkegusiiLogo } from './components/icons/EkegusiiLogo';

const App: React.FC = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('text-input');

  const stats = useMemo(() => {
    const recorded = chunks.filter(c => c.status === ChunkStatus.Recorded || c.status === ChunkStatus.Verified).length;
    const verified = chunks.filter(c => c.status === ChunkStatus.Verified).length;
    return {
      total: chunks.length,
      recorded,
      verified,
    };
  }, [chunks]);

  const handleChunksGenerated = useCallback((newChunks: Chunk[]) => {
    setChunks(newChunks);
    toast.success(`${newChunks.length} chunks created successfully!`);
    setActiveTab('recording');
  }, []);

  const handleDeleteChunk = useCallback((id: string) => {
    setChunks(prev => prev.filter(chunk => chunk.id !== id));
    toast.error('Chunk deleted.');
  }, []);

  const handleRecordingComplete = useCallback((id: string, audioBlob: Blob) => {
    setChunks(prev =>
      prev.map(chunk =>
        chunk.id === id
          ? { ...chunk, audioBlob, audioUrl: URL.createObjectURL(audioBlob), status: ChunkStatus.Recorded }
          : chunk
      )
    );
    toast.success(`Recording saved for chunk ${id}`);
  }, []);

  const handleVerification = useCallback((id: string, newStatus: ChunkStatus, newText?: string) => {
    setChunks(prev =>
      prev.map(chunk => {
        if (chunk.id === id) {
          const updatedChunk = { ...chunk, status: newStatus };
          if (newText !== undefined) {
            updatedChunk.text = newText;
          }
          return updatedChunk;
        }
        return chunk;
      })
    );
    if (newStatus === ChunkStatus.Verified) {
      toast.success(`Chunk ${id} verified!`);
    } else {
       toast.error(`Chunk ${id} rejected. Please re-record.`);
    }
  }, []);

  const handleDownloadCsv = useCallback(() => {
    const verifiedChunks = chunks.filter(c => c.status === ChunkStatus.Verified);
    if (verifiedChunks.length === 0) {
      toast.error('No verified chunks to export.');
      return;
    }
    const header = 'filename|transcription\n';
    const rows = verifiedChunks.map(c => `${c.id}.wav|${c.text.trim()}`).join('\n');
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('download', `metadata_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Metadata CSV download started.');
  }, [chunks]);
  
  const handleDownloadAudio = useCallback(async () => {
    const verifiedChunks = chunks.filter(c => c.status === ChunkStatus.Verified && c.audioBlob);
    if (verifiedChunks.length === 0) {
        toast.error('No verified audio to export.');
        return;
    }

    toast.loading('Preparing audio files for download...', { id: 'zip-toast' });
    const zip = new JSZip();
    verifiedChunks.forEach(chunk => {
        zip.file(`${chunk.id}.wav`, chunk.audioBlob!);
    });

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(zipBlob);
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('download', `ekegusii_audio_${timestamp}.zip`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Audio archive download started.', { id: 'zip-toast' });
    } catch (error) {
        console.error('Error creating zip file:', error);
        toast.error('Failed to create audio archive.', { id: 'zip-toast' });
    }
}, [chunks]);

  const handleFullExport = useCallback(async () => {
    toast.success('Starting full dataset export...');
    handleDownloadCsv();
    // Add a small delay to ensure browsers handle downloads separately
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    handleDownloadAudio();
  }, [handleDownloadCsv, handleDownloadAudio]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text-input':
        return <TextInputTab onChunksGenerated={handleChunksGenerated} existingChunks={chunks} onDeleteChunk={handleDeleteChunk} />;
      case 'recording':
        return <RecordingTab chunks={chunks.filter(c => c.status === ChunkStatus.Unrecorded)} onRecordingComplete={handleRecordingComplete} />;
      case 'verification':
        return <VerificationTab chunks={chunks.filter(c => c.status === ChunkStatus.Recorded)} onVerify={handleVerification} />;
      case 'export':
        return <ExportTab stats={stats} onDownloadCsv={handleDownloadCsv} onDownloadAudio={handleDownloadAudio} onFullExport={handleFullExport} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <EkegusiiLogo className="h-10 w-10 text-green-600"/>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-500">
              Ekegusii Speech Dataset Collector
            </h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 min-h-[60vh]">
          {renderTabContent()}
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Ekegusii Data Initiative. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
