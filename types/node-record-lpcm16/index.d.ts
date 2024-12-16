declare module 'node-record-lpcm16' {
  import { Readable } from 'stream';

  /**
   * 录音配置选项接口
   */
  interface RecordOptions {
    /** 采样率 (Hz)，默认 16000 */
    sampleRate?: number;
    /** 声道数，默认 1 (单声道) */
    channels?: number;
    /** 音频类型，如 'raw' */
    audioType?: string;
    /** 编码格式，如 'signed-integer' */
    encoding?: string;
    /** 位深度，默认 16 */
    bitDepth?: number;
    /** 录音设备名称，默认 'default' */
    device?: string;
    /** 是否输出详细日志 */
    verbose?: boolean;
  }

  /**
   * 录音机接口
   */
  interface Recorder {
    /** 获取音频流 */
    stream(): Readable;
    /** 停止录音 */
    stop(): void;
  }

  /**
   * 创建录音实例
   * @param options 录音配置选项
   * @returns 录音机实例
   */
  export function record(options?: RecordOptions): Recorder;
} 