"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioProcessor = void 0;
class DefaultAudioBufferManager {
    constructor(frameLength) {
        this.frameLength = frameLength;
        this.buffer = new Int16Array(0);
    }
    addChunk(chunk) {
        const newData = new Int16Array(chunk.buffer);
        const combinedBuffer = new Int16Array(this.buffer.length + newData.length);
        combinedBuffer.set(this.buffer);
        combinedBuffer.set(newData, this.buffer.length);
        const frames = [];
        let offset = 0;
        while (offset + this.frameLength <= combinedBuffer.length) {
            frames.push(combinedBuffer.slice(offset, offset + this.frameLength));
            offset += this.frameLength;
        }
        this.buffer = combinedBuffer.slice(offset);
        return frames;
    }
    reset() {
        this.buffer = new Int16Array(0);
    }
    getFrameLength() {
        return this.frameLength;
    }
}
class AudioProcessor {
    constructor(config) {
        this.config = config;
        this.bufferManager = new DefaultAudioBufferManager(config.frameLength);
    }
    processChunk(chunk) {
        return this.bufferManager.addChunk(chunk);
    }
}
exports.AudioProcessor = AudioProcessor;
