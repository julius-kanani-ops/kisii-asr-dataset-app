
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import JSZip from 'jszip';
import type { Chunk, Tab } from './types';
import { ChunkStatus } from './types';
import Tabs from './components/Tabs';
import HomeTab from './components/HomeTab';
import TextInputTab from './components/TextInputTab';
import RecordingTab from './components/RecordingTab';
import VerificationTab from './components/VerificationTab';
import ExportTab from './components/ExportTab';
import { EkegusiiLogo } from './components/icons/EkegusiiLogo';

// --- LocalStorage Helper Functions ---
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = async (base64: string): Promise<Blob> => {
  const res = await fetch(base64);
  return res.blob();
};
// --- End Helper Functions ---


const App: React.FC = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  // Effect to apply the theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  // Effect to load chunks from localStorage on initial render
  useEffect(() => {
    const loadChunks = async () => {
        const savedChunksJson = localStorage.getItem('ekegusii-chunks');
        if (savedChunksJson) {
            toast.loading('Resuming previous session...', { id: 'load-toast' });
            try {
                const savedChunks = JSON.parse(savedChunksJson);
                const hydratedChunks = await Promise.all(savedChunks.map(async (chunk: any) => {
                    if (chunk.audioBase64) {
                        const audioBlob = await base64ToBlob(chunk.audioBase64);
                        return { ...chunk, audioBlob, audioUrl: URL.createObjectURL(audioBlob) };
                    }
                    return chunk;
                }));
                setChunks(hydratedChunks);
                toast.success('Session restored successfully!', { id: 'load-toast' });
            } catch (error) {
                console.error("Failed to load chunks from localStorage", error);
                localStorage.removeItem('ekegusii-chunks');
                toast.error('Could not restore session.', { id: 'load-toast' });
            }
        }
    };
    loadChunks();
  }, []);

  // Effect to save chunks to localStorage whenever they change
  useEffect(() => {
    const saveChunks = async () => {
        if (chunks.length > 0) {
            const storableChunks = await Promise.all(chunks.map(async (chunk) => {
                const { audioBlob, audioUrl, ...rest } = chunk;
                if (audioBlob) {
                    try {
                        const audioBase64 = await blobToBase64(audioBlob);
                        return { ...rest, audioBase64 };
                    } catch (error) {
                       console.error("Error converting blob to base64:", error);
                       return rest; // save without audio if conversion fails
                    }
                }
                return rest;
            }));
            localStorage.setItem('ekegusii-chunks', JSON.stringify(storableChunks));
        } else {
             localStorage.removeItem('ekegusii-chunks');
        }
    };
    // Debounce saving to avoid excessive writes
    const handler = setTimeout(() => saveChunks(), 500);
    return () => clearTimeout(handler);
  }, [chunks]);


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
    toast.success(`Recording saved for chunk.`);
  }, []);

  const handleVerification = useCallback((id: string, newStatus: ChunkStatus, newText?: string) => {
    setChunks(prev =>
      prev.map(chunk => {
        if (chunk.id === id) {
          const updatedChunk = { ...chunk, status: newStatus };
          if (newText !== undefined) {
            updatedChunk.text = newText;
          }
          if (newStatus === ChunkStatus.Unrecorded) {
            // Clear audio data if rejected
            delete updatedChunk.audioBlob;
            delete updatedChunk.audioUrl;
          }
          return updatedChunk;
        }
        return chunk;
      })
    );
    if (newStatus === ChunkStatus.Verified) {
      toast.success(`Chunk verified!`);
    } else {
       toast.error(`Chunk rejected. Please re-record.`);
    }
  }, []);

  const handleDownloadCsv = useCallback(() => {
    const verifiedChunks = chunks.filter(c => c.status === ChunkStatus.Verified);
    if (verifiedChunks.length === 0) {
      toast.error('No verified chunks to export.');
      return;
    }
    const header = 'filename|transcription\n';
    const rows = verifiedChunks.map((c, index) => `sentence${index + 1}.wav|${c.text.trim()}`).join('\n');
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
    verifiedChunks.forEach((chunk, index) => {
        zip.file(`sentence${index + 1}.wav`, chunk.audioBlob!);
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

  const handleBackupExport = useCallback(async () => {
    const verifiedChunks = chunks.filter(c => c.status === ChunkStatus.Verified && c.audioBlob);
    if (verifiedChunks.length === 0) {
        toast.error('No verified chunks to create a backup.');
        return;
    }

    toast.loading('Creating backup package...', { id: 'backup-toast' });
    
    try {
        const zip = new JSZip();
        const dataFolder = zip.folder('data');
        if (!dataFolder) {
          throw new Error("Could not create data folder in zip");
        }
        const audioFolder = dataFolder.folder('audio');
        if (!audioFolder) {
          throw new Error("Could not create audio folder in zip");
        }


        // Add audio files
        verifiedChunks.forEach((chunk, index) => {
            audioFolder.file(`sentence${index + 1}.wav`, chunk.audioBlob!);
        });
        
        // Create and add metadata.csv
        const header = 'filename|transcription\n';
        const rows = verifiedChunks.map((c, index) => `sentence${index + 1}.wav|${c.text.trim()}`).join('\n');
        const csvContent = header + rows;
        dataFolder.file('metadata.csv', csvContent);

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(zipBlob);
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('download', `ekegusii_dataset_backup_${timestamp}.zip`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Backup package download started.', { id: 'backup-toast' });

    } catch (error) {
        console.error('Error creating backup zip file:', error);
        toast.error('Failed to create backup package.', { id: 'backup-toast' });
    }
  }, [chunks]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onStart={() => setActiveTab('text-input')} />;
      case 'text-input':
        return <TextInputTab onChunksGenerated={handleChunksGenerated} existingChunks={chunks} onDeleteChunk={handleDeleteChunk} />;
      case 'recording':
        return <RecordingTab chunks={chunks.filter(c => c.status === ChunkStatus.Unrecorded)} onRecordingComplete={handleRecordingComplete} />;
      case 'verification':
        return <VerificationTab chunks={chunks.filter(c => c.status === ChunkStatus.Recorded)} onVerify={handleVerification} />;
      case 'export':
        return <ExportTab stats={stats} onDownloadCsv={handleDownloadCsv} onDownloadAudio={handleDownloadAudio} onBackupExport={handleBackupExport} />;
      default:
        return null;
    }
  };

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const SunIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
  );

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
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-colors"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
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
