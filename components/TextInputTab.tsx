
import React, { useState, useCallback } from 'react';
import type { Chunk } from '../types';
import { ChunkStatus } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface TextInputTabProps {
  onChunksGenerated: (chunks: Chunk[]) => void;
  existingChunks: Chunk[];
  onDeleteChunk: (id: string) => void;
}

let chunkCounter = 0;
const generateUniqueId = (): string => {
  const timestamp = Date.now();
  chunkCounter++;
  return `ekegusii-${timestamp}-${chunkCounter}`;
};


const TextInputTab: React.FC<TextInputTabProps> = ({ onChunksGenerated, existingChunks, onDeleteChunk }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const processAndChunkText = useCallback(() => {
    if (!text.trim()) {
      alert('Please enter some text or upload a file.');
      return;
    }
    setIsProcessing(true);
    
    // Clean text: remove numbers and extra whitespace
    const cleanedText = text.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
    
    // Split into sentences. This regex is a simple approach.
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

    chunkCounter = 0; // Reset counter for each new generation
    const newChunks = sentences.map(sentence => ({
      id: generateUniqueId(),
      text: sentence.trim(),
      status: ChunkStatus.Unrecorded,
    }));
    
    onChunksGenerated(newChunks);
    setText('');
    setIsProcessing(false);
  }, [text, onChunksGenerated]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Input Ekegusii Text</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Paste your text directly into the text box below or upload a .txt file. The system will automatically clean the text by removing numbers and then split it into recordable chunks.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your Ekegusii text here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <div className="mt-4 flex items-center justify-between">
            <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
              Upload .txt File
            </label>
            <input id="file-upload" type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
            <button
              onClick={processAndChunkText}
              disabled={isProcessing || !text.trim()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Generate Chunks'}
            </button>
          </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Generated Chunks</h3>
            <div className="h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border dark:border-gray-700">
                {existingChunks.length > 0 ? (
                    <ul className="space-y-2">
                        {existingChunks.map((chunk, index) => (
                            <li key={chunk.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{index + 1}. {chunk.text}</span>
                                <button onClick={() => onDeleteChunk(chunk.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center mt-16">Chunks will appear here after generation.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TextInputTab;
