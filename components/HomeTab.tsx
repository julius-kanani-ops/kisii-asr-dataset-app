
import React from 'react';

interface HomeTabProps {
  onStart: () => void;
}

const InfoCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border dark:border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-3">{title}</h3>
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            {children}
        </div>
    </div>
);

const HomeTab: React.FC<HomeTabProps> = ({ onStart }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to the Ekegusii Speech Dataset Collector!</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your contribution is vital to preserving the Ekegusii language and bringing it into the digital age.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <InfoCard title="Our Goal">
            <p>
                We aim to build a large, high-quality, and open-source speech dataset for Ekegusii. This dataset is the first step towards creating modern language technologies like voice assistants, automatic transcription services, and educational tools for the Ekegusii-speaking community. By recording your voice, you are helping to ensure Ekegusii thrives for generations to come.
            </p>
        </InfoCard>

        <InfoCard title="How It Works">
            <p>This tool guides you through a simple four-step process:</p>
            <ol>
                <li><strong>Text Input:</strong> Add Ekegusii sentences.</li>
                <li><strong>Recording:</strong> Record yourself reading the sentences.</li>
                <li><strong>Verification:</strong> Listen and confirm the recordings are correct.</li>
                <li><strong>Export:</strong> Download the complete dataset.</li>
            </ol>
        </InfoCard>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">User Manual</h3>
        <div className="space-y-6">
            <InfoCard title="Step 1: Text Input Tab">
                <p>This is where you start. You can either paste text directly into the text area or upload a <code>.txt</code> file containing Ekegusii sentences. When you click "Generate Chunks," the app will:</p>
                <ul>
                    <li>Remove any numbers from the text.</li>
                    <li>Split the text into individual sentences (chunks) ready for recording.</li>
                    <li>Display the generated chunks in a list on the right. You can delete any unwanted chunks.</li>
                </ul>
            </InfoCard>
            <InfoCard title="Step 2: Recording Tab">
                <p>Here you'll see a list of all unrecorded text chunks. For each chunk:</p>
                <ul>
                    <li>Click the <strong>Record</strong> button to start your microphone.</li>
                    <li>Read the sentence clearly. Aim for a recording duration between <strong>15-20 seconds</strong>. The app will show a warning if it's too short or too long.</li>
                    <li>Click <strong>Stop</strong> when you're done.</li>
                    <li>You can then <strong>Play</strong> the recording to listen, <strong>Re-record</strong> if you're not happy, or <strong>Save</strong> it to proceed.</li>
                </ul>
            </InfoCard>
            <InfoCard title="Step 3: Verification Tab">
                <p>This is a crucial quality-control step. You'll review all saved recordings.</p>
                <ul>
                    <li>The first recording will autoplay. You can use the text box to fix any transcription errors.</li>
                    <li>Use the <strong>keyboard shortcuts</strong> for a fast workflow: <kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Spacebar</kbd> to play/pause, <kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to approve, and <kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Backspace</kbd> to reject.</li>
                    <li><strong>Approve</strong> a recording if it's clear and matches the text. <strong>Reject</strong> it if there's a mistake, loud background noise, or other issues. Rejected recordings go back to the Recording tab.</li>
                </ul>
            </InfoCard>
            <InfoCard title="Step 4: Export Tab">
                 <p>Once you have verified recordings, you can export your dataset. You have three options:</p>
                 <ul>
                    <li><strong>Metadata (CSV):</strong> Downloads a <code>metadata.csv</code> file mapping filenames to transcriptions (e.g., <code>sentence1.wav|Omwana nigo abwate...</code>).</li>
                    <li><strong>Audio Files (.zip):</strong> Downloads a zip file containing all your verified <code>.wav</code> audio files.</li>
                    <li><strong>Download Backup (.zip):</strong> This is the recommended option. It packages everything into a single zip file with the required <code>data/audio/</code> folder structure and the metadata file, ready for backup or sharing.</li>
                 </ul>
            </InfoCard>
        </div>
      </div>
      
      <div className="text-center pt-4">
        <button
          onClick={onStart}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105"
        >
          Let's Get Started!
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
