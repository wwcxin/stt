declare module 'node-microphone' {
  import { EventEmitter } from 'events';

  interface MicrophoneOptions {
    rate?: number;
    channels?: number;
    bitwidth?: number;
    encoding?: string;
    device?: string;
    exitOnSilence?: number;
    debug?: boolean;
    fileType?: string;
  }

  class Microphone extends EventEmitter {
    constructor(options?: MicrophoneOptions);
    startRecording(options?: MicrophoneOptions): NodeJS.ReadableStream;
    stopRecording(): void;
  }

  export = Microphone;
} 