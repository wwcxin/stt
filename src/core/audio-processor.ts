import { AudioConfig, AudioBufferManager } from '../types';

class DefaultAudioBufferManager implements AudioBufferManager {
  private buffer: Int16Array;
  private readonly frameLength: number;

  constructor(frameLength: number) {
    this.frameLength = frameLength;
    this.buffer = new Int16Array(0);
  }

  public addChunk(chunk: Buffer): Int16Array[] {
    const newData = new Int16Array(chunk.buffer);
    const combinedBuffer = new Int16Array(this.buffer.length + newData.length);
    combinedBuffer.set(this.buffer);
    combinedBuffer.set(newData, this.buffer.length);

    const frames: Int16Array[] = [];
    let offset = 0;

    while (offset + this.frameLength <= combinedBuffer.length) {
      frames.push(combinedBuffer.slice(offset, offset + this.frameLength));
      offset += this.frameLength;
    }

    this.buffer = combinedBuffer.slice(offset);
    return frames;
  }

  public reset(): void {
    this.buffer = new Int16Array(0);
  }

  public getFrameLength(): number {
    return this.frameLength;
  }
}

export class AudioProcessor {
  private readonly bufferManager: AudioBufferManager;
  private readonly config: AudioConfig;
  
  constructor(config: AudioConfig) {
    this.config = config;
    this.bufferManager = new DefaultAudioBufferManager(config.frameLength);
  }
  
  public processChunk(chunk: Buffer): Int16Array[] {
    return this.bufferManager.addChunk(chunk);
  }
} 