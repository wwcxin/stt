declare module 'node-record-lpcm16' {
  interface RecordOptions {
    sampleRate?: number;
    channels?: number;
    audioType?: string;
    encoding?: string;
    bitDepth?: number;
    device?: string;
    silence?: string;
    threshold?: number;
    thresholdStart?: number;
    thresholdEnd?: number;
    silence?: boolean;
    verbose?: boolean;
  }

  interface Recorder {
    stream(): NodeJS.ReadableStream;
    stop(): void;
  }

  interface RecordInstance {
    record(options?: RecordOptions): Recorder;
  }

  const record: RecordInstance;
  export = record;
} 