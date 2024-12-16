import { Porcupine, PorcupineError } from '@picovoice/porcupine-node';
import { HotwordConfig } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class HotwordDetector {
  private porcupine: Porcupine | null = null;
  private readonly config: HotwordConfig;
  
  constructor(config: HotwordConfig) {
    this.config = config;
  }
  
  public async initialize(): Promise<void> {
    try {
      const modelPath = path.resolve(process.cwd(), this.config.modelPath);
      
      if (!fs.existsSync(modelPath)) {
        throw new Error(`找不到模型文件: ${modelPath}`);
      }

      const keywordPaths: string[] = [];
      const sensitivities: number[] = [];

      for (const [key, value] of Object.entries(this.config.keywords)) {
        const keywordPath = path.resolve(process.cwd(), value.path);
        if (!fs.existsSync(keywordPath)) {
          throw new Error(`找不到关键词文件: ${keywordPath}`);
        }
        keywordPaths.push(keywordPath);
        sensitivities.push(value.sensitivity);

        console.log(`加载关键词: ${key} -> ${keywordPath}`);
      }

      console.log('使用模型文件:', modelPath);
      
      this.porcupine = new Porcupine(
        'oUrzqSj688RjE5emQWgBa7z6foXSVYlZBsZk47gZJhdQ1yhyH5b1dQ==',
        keywordPaths,
        sensitivities,
        modelPath
      );

      console.log('热词检测初始化成功');
    } catch (error) {
      console.error('热词检测初始化失败:', error);
      throw error;
    }
  }
  
  public processFrame(frame: Int16Array): number {
    if (!this.porcupine) {
      throw new Error('热词检测器未初始化');
    }
    return this.porcupine.process(frame);
  }

  public release(): void {
    if (this.porcupine) {
      this.porcupine.release();
      this.porcupine = null;
    }
  }

  public get frameLength(): number {
    if (!this.porcupine) {
      throw new Error('热词检测器未初始化');
    }
    return this.porcupine.frameLength;
  }
} 