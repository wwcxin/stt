import { EventEmitter } from 'events';
import { PluginSystem } from './plugin-system';
import { RecognitionEvent, Config, AudioConfig, HotwordConfig } from '../types';
import { VoiceRecognition } from './voice-recognition';
import { ConfigManager } from '../utils/config';
import { AudioProcessor } from './audio-processor';
import { HotwordDetector } from './hotword-detector';
import * as record from 'node-record-lpcm16';
import * as path from 'path';
import { Context } from './context';

export interface LogOptions {
  showRealtime: boolean;
  showOffline: boolean;
  showHotwords: boolean;
}

export class VoiceRecognitionFramework extends EventEmitter {
  private static instance: VoiceRecognitionFramework;
  private audioProcessor!: AudioProcessor;
  private hotwordDetector!: HotwordDetector;
  private pluginSystem!: PluginSystem;
  private recognition!: VoiceRecognition;
  private recognitionResults: RecognitionEvent[] = [];
  private recorder: any = null;
  private isRecording: boolean = false;
  private readonly config: Config;
  private readonly logOptions: LogOptions = {
    showRealtime: false,  // 不显示实时识别结果
    showOffline: true,    // 显示离线识别结果
    showHotwords: true    // 显示热词检测结果
  };

  public static getInstance(): VoiceRecognitionFramework {
    if (!VoiceRecognitionFramework.instance) {
      VoiceRecognitionFramework.instance = new VoiceRecognitionFramework();
    }
    return VoiceRecognitionFramework.instance;
  }

  private constructor() {
    super();
    this.config = ConfigManager.getInstance().getConfig();
    this.initComponents();
  }

  private initComponents(): void {
    // 初始化音频处理器
    const audioConfig: AudioConfig = {
      sampleRate: this.config.audio.sampleRate,
      channels: this.config.audio.channels,
      bitDepth: this.config.audio.bitDepth,
      frameLength: this.config.audio.frameLength
    };
    this.audioProcessor = new AudioProcessor(audioConfig);

    // 初始化热词检测器
    const hotwordConfig: HotwordConfig = {
      modelPath: this.config.models.porcupine.path,
      keywords: this.config.porcupineHotwords
    };
    this.hotwordDetector = new HotwordDetector(hotwordConfig);

    // 初始化语音识别
    const serverUrl = `ws://${this.config.server.host}:${this.config.server.port}`;
    this.recognition = new VoiceRecognition(serverUrl);

    // 初始化插件系统
    this.pluginSystem = new PluginSystem();

    // 设置事件处理
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    const ctx = Context.getInstance();

    this.recognition.on('recognitionComplete', async (event: RecognitionEvent) => {
      this.recognitionResults.push(event);
      // 更新 Context
      ctx.setEvent(event);
      await this.pluginSystem.handleEvent(event);
      // 重置 Context
      ctx.reset();
    });
  }

  public async initialize(): Promise<void> {
    try {
      // 初始化热词检测
      await this.hotwordDetector.initialize();
      console.log('热词检测初始化成功');

      // 加载插件
      await this.loadPlugins();
      console.log('插件加载完成');
    } catch (error) {
      console.error('初始化失败:', error);
      throw error;
    }
  }

  private async loadPlugins(): Promise<void> {
    for (const pluginName of this.config.plugins) {
      try {
        const pluginConfig = {
          name: pluginName,
          path: path.join(__dirname, '..', '..', 'src', 'plugins', pluginName)
        };
        await this.pluginSystem.loadPlugin(pluginName, pluginConfig);
      } catch (error) {
        console.error(`加载插件 ${pluginName} 失败:`, error);
      }
    }
  }

  private async processAudio(chunk: Buffer): Promise<void> {
    try {
      const ctx = Context.getInstance();
      const frames = this.audioProcessor.processChunk(chunk);
      
      for (const frame of frames) {
        const keywordIndex = this.hotwordDetector.processFrame(frame);
        if (keywordIndex !== -1 && this.logOptions.showHotwords) {
          console.log('[声音匹配] 检测到热词');
          ctx.setKeywordTriggered(true);
          await this.pluginSystem.handleHotwordDetection();
        }

        await this.pluginSystem.handleAudioData(frame);
      }

      if (this.recognition.isConnected()) {
        this.recognition.sendAudio(chunk);
      } else if (Math.random() < 0.01) {
        console.warn('语音识别服务未连接');
      }
    } catch (error) {
      console.error('音频处理失败:', error);
    }
  }

  public startRecording(): void {
    if (this.isRecording) return;
    this.isRecording = true;

    try {
      this.recorder = record.record({
        sampleRate: this.config.audio.sampleRate,
        channels: this.config.audio.channels,
        audioType: 'raw',
        encoding: 'signed-integer',
        bitDepth: this.config.audio.bitDepth
      });

      const stream = this.recorder.stream();
      stream.on('data', async (chunk: Buffer) => {
        await this.processAudio(chunk);
      });

      stream.on('error', (error: Error) => {
        console.error('录音错误:', error);
        this.stopRecording();
      });

      console.log('开始录音...');
    } catch (error) {
      console.error('启动录音失败:', error);
      this.isRecording = false;
    }
  }

  public stopRecording(): void {
    if (!this.isRecording) return;
    this.isRecording = false;
    
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
  }

  public async reloadPlugins(): Promise<void> {
    await this.pluginSystem.unloadAll();
    await this.loadPlugins();
  }

  public getResults(): RecognitionEvent[] {
    return this.recognitionResults;
  }

  public close(): void {
    this.stopRecording();
    this.hotwordDetector.release();
    this.recognition.close();
    this.pluginSystem.unloadAll();
  }

  public setLogOptions(options: Partial<LogOptions>): void {
    Object.assign(this.logOptions, options);
  }
} 