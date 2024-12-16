export interface Plugin {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onAudioData?(audioData: Int16Array): Promise<void>;
  onHotwordDetected?(): Promise<void>;
  handle(event: RecognitionEvent): Promise<void>;
}

export interface RecognitionEvent {
  is_final: boolean;
  mode: '2pass-online' | '2pass-offline' | 'online' | 'offline';
  text: string;
  wav_name: string;
  stamp_sents?: Array<{
    end: number;
    punc: string;
    start: number;
    text_seg: string;
  }>;
  timestamp?: string;
}

export interface FunASRHotword {
  score: number;
}

export interface PorcupineHotword {
  path: string;
  sensitivity: number;
}

export interface FunASRConfig {
  chunk_size: [number, number, number];
  wav_name: string;
  is_speaking: boolean;
  wav_format: 'pcm';
  chunk_interval: number;
  itn: boolean;
  mode: '2pass' | 'online' | 'offline';
  hotwords: string;  // JSON string
}

export interface Config {
  plugins: string[];
  mode: '2pass' | 'online' | 'offline';
  hotwords: {
    [key: string]: FunASRHotword;
  };
  porcupineHotwords: {
    [key: string]: PorcupineHotword;
  };
  server: {
    host: string;
    port: number;
  };
  audio: {
    sampleRate: number;
    channels: number;
    bitDepth: number;
    frameLength: number;
    chunkSize: [number, number, number];
    chunkInterval: number;
  };
  models: {
    porcupine: {
      language: string;
      path: string;
      accessKey: string;
    };
  };
  itn: boolean;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  frameLength: number;
}

export interface HotwordConfig {
  modelPath: string;
  keywords: {
    [key: string]: PorcupineHotword;
  };
}

export interface PluginConfig {
  name: string;
  path: string;
  options?: Record<string, any>;
}

export interface AudioBufferManager {
  addChunk(chunk: Buffer): Int16Array[];
  reset(): void;
  getFrameLength(): number;
} 