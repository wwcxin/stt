import * as fs from 'fs';
import * as TOML from '@iarna/toml';
import { Config } from '../types';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    try {
      const configPath = './config/asr.config.toml';
      const configFile = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = TOML.parse(configFile) as any;

      // 验证并转换配置
      this.validateConfig(parsedConfig);
      this.config = parsedConfig as Config;
    } catch (error) {
      console.error('配置加载失败:', error);
      throw new Error('配置初始化失败');
    }
  }

  private validateConfig(config: any): void {
    if (!config.plugins || !Array.isArray(config.plugins)) {
      throw new Error('配置错误: plugins 必须是数组');
    }
    if (!config.mode || typeof config.mode !== 'string') {
      throw new Error('配置错误: mode 必须是字符串');
    }
    if (!config.hotwords || typeof config.hotwords !== 'object') {
      throw new Error('配置错误: hotwords 必须是对象');
    }
    if (!config.server || !config.server.host || !config.server.port) {
      throw new Error('配置错误: server 配置不完整');
    }
    if (!config.audio || !this.validateAudioConfig(config.audio)) {
      throw new Error('配置错误: audio 配置不完整');
    }
    if (!config.models?.porcupine || !this.validatePorcupineConfig(config.models.porcupine)) {
      throw new Error('配置错误: porcupine 配置不完整');
    }
  }

  private validateAudioConfig(audio: any): boolean {
    return (
      typeof audio.sampleRate === 'number' &&
      typeof audio.channels === 'number' &&
      typeof audio.bitDepth === 'number' &&
      typeof audio.frameLength === 'number'
    );
  }

  private validatePorcupineConfig(porcupine: any): boolean {
    return (
      typeof porcupine.language === 'string' &&
      typeof porcupine.path === 'string'
    );
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }
} 