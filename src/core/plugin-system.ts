import { EventEmitter } from 'events';
import { Plugin, PluginConfig, RecognitionEvent } from '../types';

export class PluginSystem {
  private readonly plugins: Map<string, Plugin> = new Map();
  private readonly eventBus: EventEmitter;
  
  constructor() {
    this.eventBus = new EventEmitter();
  }

  public async loadPlugin(name: string, config: PluginConfig): Promise<void> {
    try {
      const plugin = require(config.path).default;
      if (plugin.onLoad) {
        await plugin.onLoad();
      }
      this.plugins.set(name, plugin);
      console.log(`插件 ${name} 加载成功`);
    } catch (error) {
      console.error(`插件 ${name} 加载失败:`, error);
    }
  }
  
  public emit(event: string, data: any): void {
    this.eventBus.emit(event, data);
  }

  public async handleEvent(event: RecognitionEvent): Promise<void> {
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        await plugin.handle(event);
      } catch (error) {
        console.error(`插件 ${name} 处理事件失败:`, error);
      }
    }
  }

  public async handleHotwordDetection(): Promise<void> {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.onHotwordDetected) {
        try {
          await plugin.onHotwordDetected();
        } catch (error) {
          console.error(`插件 ${name} 处理热词检测失败:`, error);
        }
      }
    }
  }

  public async handleAudioData(audioData: Int16Array): Promise<void> {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.onAudioData) {
        try {
          await plugin.onAudioData(audioData);
        } catch (error) {
          console.error(`插件 ${name} 处理音频失败:`, error);
        }
      }
    }
  }

  public async unloadAll(): Promise<void> {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.onUnload) {
        try {
          await plugin.onUnload();
        } catch (error) {
          console.error(`插件 ${name} 卸载失败:`, error);
        }
      }
    }
    this.plugins.clear();
  }
} 