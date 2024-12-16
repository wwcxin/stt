declare module 'node-microphone' {
  import { EventEmitter } from 'events';

  /**
   * 麦克风配置选项接口
   */
  interface MicrophoneOptions {
    /** 采样率 (Hz) */
    rate?: number;
    /** 声道数 */
    channels?: number;
    /** 录音设备名称 */
    device?: string;
    /** 是否输出调试信息 */
    debug?: boolean;
    /** 静音检测退出时间（秒） */
    exitOnSilence?: number;
  }

  /**
   * 麦克风类
   * 继承自 EventEmitter，可以监听音频数据事件
   */
  class Microphone extends EventEmitter {
    /**
     * 创建麦克风实例
     * @param options 麦克风配置选项
     */
    constructor(options?: MicrophoneOptions);
    
    /**
     * 开始录音
     */
    startRecording(): void;
    
    /**
     * 停止录音
     */
    stopRecording(): void;
    
    /**
     * 获取音频流
     * @returns 可读流
     */
    getAudioStream(): NodeJS.ReadableStream;
  }

  export = Microphone;
} 