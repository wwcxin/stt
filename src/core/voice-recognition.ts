import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { ConfigManager } from '../utils/config';
import { RecognitionEvent, FunASRConfig } from '../types';

export class VoiceRecognition extends EventEmitter {
  private ws!: WebSocket;
  private isRecording: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 2000;
  private isInitialized: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private serverUrl: string) {
    super();
    this.connect();
  }

  private connect() {
    try {
      if (this.ws) {
        this.ws.removeAllListeners();
        this.ws.close();
      }

      console.log(`正在连接到服务器: ${this.serverUrl}`);
      this.ws = new WebSocket(this.serverUrl, {
        handshakeTimeout: 5000,  // 5秒超时
        timeout: 5000
      });

      this.initWebSocket();
      this.isInitialized = true;
    } catch (error) {
      console.error('WebSocket 连接创建失败:', error);
      this.handleDisconnect();
    }
  }

  private initWebSocket() {
    if (!this.ws) return;

    this.ws.on('open', () => {
      console.log('WebSocket 连接已建立');
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      const config = ConfigManager.getInstance().getConfig();
      const wsConfig: FunASRConfig = {
        chunk_size: config.audio.chunkSize,
        wav_name: 'realtime_recognition',
        is_speaking: true,
        wav_format: 'pcm',
        chunk_interval: config.audio.chunkInterval,
        itn: config.itn,
        mode: config.mode,
        hotwords: JSON.stringify(
          Object.entries(config.hotwords).reduce((acc, [key, value]) => {
            acc[key] = value.score;
            return acc;
          }, {} as Record<string, number>)
        )
      };

      try {
        const configStr = JSON.stringify(wsConfig);
        console.log('发送配置:', configStr);
        this.ws.send(configStr);
      } catch (error) {
        console.error('发送配置失败:', error);
      }
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const result: RecognitionEvent = JSON.parse(data.toString());
        this.handleRecognitionResult(result);
      } catch (error) {
        console.error('解析识别结果失败:', error);
      }
    });

    this.ws.on('error', (error: Error) => {
      const wsError = error as any;
      console.error('WebSocket 错误:', {
        message: wsError.message,
        code: wsError.code,
        address: wsError.address,
        port: wsError.port
      });
    });

    this.ws.on('close', (code: number, reason: string) => {
      const closeInfo = {
        code,
        reason: reason || '未知原因',
        wasClean: code === 1000
      };
      console.log('WebSocket 连接已关闭:', closeInfo);
      this.handleDisconnect();
    });
  }

  private handleDisconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('WebSocket 重连失败，已达到最大重试次数');
      this.emit('connectionFailed');
    }
  }

  private handleRecognitionResult(result: RecognitionEvent) {
    if (result.mode === '2pass-offline') {
      if (result.text) {
        console.log(`[离线识别] ${result.text}`);
        this.emit('recognitionComplete', result);
      }
    } else if (result.mode === '2pass-online' && result.text) {
      this.emit('recognitionComplete', result);
    }
  }

  public sendAudio(chunk: Buffer): void {
    if (!this.ws || !this.isConnected()) {
      console.warn('WebSocket 未连接，无法发送音频数据');
      return;
    }
    try {
      this.ws.send(chunk);
    } catch (error) {
      console.error('发送音频数据失败:', error);
      this.handleDisconnect();
    }
  }

  public close(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;  // 停止重连
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws && this.isConnected()) {
      try {
        this.ws.send(JSON.stringify({ is_speaking: false }));
        this.ws.close(1000, '正常关闭');
      } catch (error) {
        console.error('关闭连接失败:', error);
      }
    }
    this.isInitialized = false;
  }

  public isConnected(): boolean {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
} 