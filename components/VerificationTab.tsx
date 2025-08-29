
import React, { useState, useRef, useEffect } from 'react';
import type { Chunk } from '../types';
import { ChunkStatus } from '../types';
import { PlayIcon, PauseIcon } from './icons/RecordingIcons';
import { CheckIcon } from './icons/CheckIcon';
import { RejectIcon } from './icons/RejectIcon';

interface VerificationTabProps {
  chunks: Chunk[];
  onVerify: (id: string, newStatus: ChunkStatus, newText?: string) => void;
}

const VerificationItem: React.FC<{ chunk: Chunk; onVerify: (id: string, newStatus: ChunkStatus, newText?: string) => void; }> = ({ chunk, onVerify }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedText, setEditedText] = useState(chunk.text);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnd = () => setIsPlaying(false);
    if (audio) {
      audio.addEventListener('ended', handleEnd);
      return () => audio.removeEventListener('ended', handleEnd);
    }
  }, [audioRef.current]);

  const handleApprove = () => {
    onVerify(chunk.id, ChunkStatus.Verified, editedText);
  };
  
  const handleReject = () => {
    onVerify(chunk.id, ChunkStatus.Unrecorded);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={togglePlayback} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors flex-shrink-0">
          {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <audio ref={audioRef} src={chunk.audioUrl} className="hidden" />
        <input 
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={handleReject} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <RejectIcon className="w-5 h-5" />
            <span>Reject & Re-record</span>
        </button>
        <button onClick={handleApprove} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <CheckIcon className="w-5 h-5" />
            <span>Approve</span>
        </button>
      </div>
    </div>
  );
};


const VerificationTab: React.FC<VerificationTabProps> = ({ chunks, onVerify }) => {
  if (chunks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No recordings to verify.</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Complete recordings in the 'Recording' tab first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Verify Recordings</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Listen to each recording, edit the transcription if necessary, and then either 'Approve' it or 'Reject' it to be re-recorded.
      </p>
      <div className="space-y-4">
        {chunks.map(chunk => (
          <VerificationItem key={chunk.id} chunk={chunk} onVerify={onVerify} />
        ))}
      </div>
    </div>
  );
};

export default VerificationTab;
