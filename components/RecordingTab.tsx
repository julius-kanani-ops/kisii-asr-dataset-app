import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chunk } from '../types';
import { MicIcon, StopIcon, PlayIcon, PauseIcon, SaveIcon } from './icons/RecordingIcons';

interface RecordingTabProps {
  chunks: Chunk[];
  onRecordingComplete: (id: string, audioBlob: Blob) => void;
}

const AudioRecorder: React.FC<{ chunk: Chunk; onSave: (blob: Blob) => void }> = ({ chunk, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // For live timer
  const [duration, setDuration] = useState(0); // For final duration
  const [durationWarning, setDurationWarning] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  const startRecording = async () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setDurationWarning(null);
    setRecordingTime(0);
    audioChunks.current = [];
    cleanupRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }
    }
  };
  
  const togglePlayback = () => {
      if(audioRef.current) {
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
    if (audio && audioUrl) {
        const handleMetadata = () => {
            const audioDuration = audio.duration;
            setDuration(audioDuration);
            if (audioDuration < 15) {
                setDurationWarning('Recording is too short (ideal: 15-20s).');
            } else if (audioDuration > 20) {
                setDurationWarning('Recording is too long (ideal: 15-20s).');
            } else {
                setDurationWarning(null);
            }
        };
        audio.addEventListener('loadedmetadata', handleMetadata);
        return () => audio.removeEventListener('loadedmetadata', handleMetadata);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnd = () => setIsPlaying(false);
    if(audio) {
      audio.addEventListener('ended', handleEnd);
      return () => audio.removeEventListener('ended', handleEnd);
    }
  }, [audioRef, audioUrl]);

  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob);
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setDurationWarning(null);
      setRecordingTime(0);
    }
  };

  useEffect(() => {
      return () => cleanupRecording();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner flex flex-col items-center justify-between space-y-4">
      <p className="text-gray-800 dark:text-gray-200 w-full text-center">{chunk.text}</p>
      
      <div className="w-full flex flex-col sm:flex-row items-center justify-between sm:space-x-4">
        <div className="flex-1 min-w-[200px] h-12 flex items-center justify-center sm:justify-start">
          {isRecording && (
            <span className="text-lg font-mono text-red-500 animate-pulse">
              {formatTime(recordingTime)}
            </span>
          )}
          {audioUrl && duration > 0 && (
            <div className="text-sm text-center sm:text-left">
                <p className="font-mono text-gray-700 dark:text-gray-300">Duration: {duration.toFixed(1)}s</p>
                {durationWarning && <p className="font-semibold text-yellow-600 dark:text-yellow-400">{durationWarning}</p>}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!isRecording && !audioUrl && (
            <button onClick={startRecording} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
              <MicIcon className="w-5 h-5" />
              <span>Record</span>
            </button>
          )}
          {isRecording && (
            <button onClick={stopRecording} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full transition-colors animate-pulse">
              <StopIcon className="w-5 h-5" />
              <span>Stop</span>
            </button>
          )}
          {audioUrl && (
            <>
              <audio ref={audioRef} src={audioUrl} className="hidden" preload="metadata"></audio>
              <button onClick={togglePlayback} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors">
                  {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </button>
              <button onClick={startRecording} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                Re-record
              </button>
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors flex items-center space-x-2">
                <SaveIcon className="w-5 h-5" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const RecordingTab: React.FC<RecordingTabProps> = ({ chunks, onRecordingComplete }) => {
  if (chunks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">All chunks have been recorded!</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Please proceed to the 'Verification' tab to review your recordings.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Record Audio</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Click the 'Record' button for each chunk to record your voice. Aim for a duration of 15-20 seconds. You can listen, re-record, and then save the audio.
      </p>
      <div className="space-y-4">
        {chunks.map(chunk => (
          <AudioRecorder key={chunk.id} chunk={chunk} onSave={(blob) => onRecordingComplete(chunk.id, blob)} />
        ))}
      </div>
    </div>
  );
};

export default RecordingTab;