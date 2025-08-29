
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chunk } from '../types';
import { ChunkStatus } from '../types';
import { PlayIcon, PauseIcon } from './icons/RecordingIcons';
import { CheckIcon } from './icons/CheckIcon';
import { RejectIcon } from './icons/RejectIcon';

interface VerificationItemProps {
  chunk: Chunk;
  onVerify: (id: string, newStatus: ChunkStatus, newText?: string) => void;
  isActive: boolean;
  onSetActive: () => void;
  onCycleNext: () => void;
}

const VerificationItem: React.FC<VerificationItemProps> = ({ chunk, onVerify, isActive, onSetActive, onCycleNext }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedText, setEditedText] = useState(chunk.text);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleApprove = useCallback(() => {
    onVerify(chunk.id, ChunkStatus.Verified, editedText);
    onCycleNext();
  }, [chunk.id, editedText, onVerify, onCycleNext]);
  
  const handleReject = useCallback(() => {
    onVerify(chunk.id, ChunkStatus.Unrecorded);
    onCycleNext();
  }, [chunk.id, onVerify, onCycleNext]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isActive) return;

        switch (event.key) {
            case ' ':
                event.preventDefault();
                togglePlayback();
                break;
            case 'Enter':
                event.preventDefault();
                handleApprove();
                break;
            case 'Backspace':
            case 'Delete':
                event.preventDefault();
                handleReject();
                break;
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, togglePlayback, handleApprove, handleReject]);

  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      if (isActive) {
        audio.play().catch(e => console.error("Autoplay was prevented.", e));
      }

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
  }, [isActive]);


  return (
    <div 
        onClick={onSetActive} 
        className={`p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md flex flex-col space-y-4 cursor-pointer transition-all duration-200
            ${isActive ? 'ring-2 ring-green-500 shadow-xl' : 'ring-1 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'}
        `}
        aria-label={`Verification item for: ${chunk.text}. ${isActive ? 'Currently active.' : ''}`}
    >
      <div className="flex items-start space-x-4">
        <button onClick={togglePlayback} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <audio ref={audioRef} src={chunk.audioUrl} className="hidden" preload="auto" />
        <textarea 
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={handleReject} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <RejectIcon className="w-5 h-5" />
            <span>Reject (Backspace)</span>
        </button>
        <button onClick={handleApprove} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <CheckIcon className="w-5 h-5" />
            <span>Approve (Enter)</span>
        </button>
      </div>
    </div>
  );
};


const VerificationTab: React.FC<{ chunks: Chunk[]; onVerify: (id: string, newStatus: ChunkStatus, newText?: string) => void; }> = ({ chunks, onVerify }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= chunks.length && chunks.length > 0) {
      setActiveIndex(chunks.length - 1);
    } else if (chunks.length === 0) {
      setActiveIndex(0);
    }
  }, [chunks.length, activeIndex]);

  const handleCycleNext = () => {
      setActiveIndex(current => {
          if (current >= chunks.length - 1) {
              return current;
          }
          return current + 1;
      });
  };

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
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-blue-800 dark:text-blue-200">
            <span className="font-bold">Pro-Tip:</span> Use your keyboard for faster verification!
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Spacebar</kbd> to play/pause the active recording.</li>
            <li><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to approve and move to the next.</li>
            <li><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Backspace</kbd> to reject and move to the next.</li>
        </ul>
      </div>
      <div className="space-y-4">
        {chunks.map((chunk, index) => (
          <VerificationItem 
            key={chunk.id} 
            chunk={chunk} 
            onVerify={onVerify}
            isActive={index === activeIndex}
            onSetActive={() => setActiveIndex(index)}
            onCycleNext={handleCycleNext}
          />
        ))}
      </div>
    </div>
  );
};

export default VerificationTab;
