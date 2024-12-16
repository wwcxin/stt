/**
 * Porcupine 热词检测引擎的类型定义
 */
declare module '@picovoice/porcupine-node' {
  /**
   * Porcupine 配置选项接口
   */
  export interface PorcupineOptions {
    /** 模型文件路径 */
    modelPath?: string;
    /** 库文件路径 */
    libraryPath?: string;
  }

  /**
   * Porcupine 热词检测引擎类
   */
  export class Porcupine {
    /**
     * 创建 Porcupine 实例
     * @param accessKey Picovoice 访问密钥
     * @param keywordPaths 热词模型文件路径数组
     * @param sensitivities 每个热词的灵敏度数组 (0-1)
     * @param modelPath 模型文件路径
     */
    constructor(
      accessKey: string,
      keywordPaths: string[],
      sensitivities: number[],
      modelPath: string
    );

    /**
     * 处理一帧音频数据
     * @param audioFrame 音频帧数据 (16位整数数组)
     * @returns 检测到的热词索引，-1 表示未检测到
     */
    process(audioFrame: Int16Array): number;

    /**
     * 释放资源
     */
    release(): void;

    /** 每帧音频样本数 */
    readonly frameLength: number;
    /** 要求的音频采样率 */
    readonly sampleRate: number;
    /** Porcupine 版本号 */
    readonly version: string;
  }

  /**
   * Porcupine 基础错误类
   */
  export class PorcupineError extends Error {
    constructor(message: string);
  }

  /**
   * 参数无效错误
   * 当提供的参数不符合要求时抛出
   */
  export class PorcupineInvalidArgumentError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 状态无效错误
   * 当在错误的状态下调用方法时抛出
   */
  export class PorcupineInvalidStateError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 激活错误
   * 当访问密钥验证失败时抛出
   */
  export class PorcupineActivationError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 激活限制错误
   * 当超过激活限制时抛出
   */
  export class PorcupineActivationLimitError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 激活节流错误
   * 当请求过于频繁时抛出
   */
  export class PorcupineActivationThrottledError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 激活拒绝错误
   * 当激活请求被拒绝时抛出
   */
  export class PorcupineActivationRefusedError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 运行时错误
   * 当发生意外的运行时错误时抛出
   */
  export class PorcupineRuntimeError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 停止迭代错误
   * 当处理过程需要停止时抛出
   */
  export class PorcupineStopIterationError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 内存不足错误
   * 当系统内存不足时抛出
   */
  export class PorcupineOutOfMemoryError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * IO错误
   * 当文件操作失败时抛出
   */
  export class PorcupineIOError extends PorcupineError {
    constructor(message: string);
  }

  /**
   * 密钥错误
   * 当访问密钥相关操作失败时抛出
   */
  export class PorcupineKeyError extends PorcupineError {
    constructor(message: string);
  }
} 