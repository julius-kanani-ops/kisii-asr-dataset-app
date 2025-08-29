
export enum ChunkStatus {
  Unrecorded = 'Unrecorded',
  Recorded = 'Recorded',
  Verified = 'Verified',
}

export interface Chunk {
  id: string;
  text: string;
  status: ChunkStatus;
  audioBlob?: Blob;
  audioUrl?: string;
}

export type Tab = 'home' | 'text-input' | 'recording' | 'verification' | 'export';

export interface Stats {
  total: number;
  recorded: number;
  verified: number;
}
