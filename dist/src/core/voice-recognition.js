"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceRecognition = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const config_1 = require("../utils/config");
class VoiceRecognition extends events_1.EventEmitter {
    constructor(serverUrl) {
        super();
        this.serverUrl = serverUrl;
        this.isRecording = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.isInitialized = false;
        this.reconnectTimer = null;
        this.connect();
    }
    connect() {
        try {
            if (this.ws) {
                this.ws.removeAllListeners();
                this.ws.close();
            }
            console.log(`正在连接到服务器: ${this.serverUrl}`);
            this.ws = new ws_1.default(this.serverUrl, {
                handshakeTimeout: 5000, // 5秒超时
                timeout: 5000
            });
            this.initWebSocket();
            this.isInitialized = true;
        }
        catch (error) {
            console.error('WebSocket 连接创建失败:', error);
            this.handleDisconnect();
        }
    }
    initWebSocket() {
        if (!this.ws)
            return;
        this.ws.on('open', () => {
            console.log('WebSocket 连接已建立');
            this.reconnectAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            const config = config_1.ConfigManager.getInstance().getConfig();
            const wsConfig = {
                chunk_size: config.audio.chunkSize,
                wav_name: 'realtime_recognition',
                is_speaking: true,
                wav_format: 'pcm',
                chunk_interval: config.audio.chunkInterval,
                itn: config.itn,
                mode: config.mode,
                hotwords: JSON.stringify(Object.entries(config.hotwords).reduce((acc, [key, value]) => {
                    acc[key] = value.score;
                    return acc;
                }, {}))
            };
            try {
                const configStr = JSON.stringify(wsConfig);
                console.log('发送配置:', configStr);
                this.ws.send(configStr);
            }
            catch (error) {
                console.error('发送配置失败:', error);
            }
        });
        this.ws.on('message', (data) => {
            try {
                const result = JSON.parse(data.toString());
                this.handleRecognitionResult(result);
            }
            catch (error) {
                console.error('解析识别结果失败:', error);
            }
        });
        this.ws.on('error', (error) => {
            const wsError = error;
            console.error('WebSocket 错误:', {
                message: wsError.message,
                code: wsError.code,
                address: wsError.address,
                port: wsError.port
            });
        });
        this.ws.on('close', (code, reason) => {
            const closeInfo = {
                code,
                reason: reason || '未知原因',
                wasClean: code === 1000
            };
            console.log('WebSocket 连接已关闭:', closeInfo);
            this.handleDisconnect();
        });
    }
    handleDisconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
        }
        else {
            console.error('WebSocket 重连失败，已达到最大重试次数');
            this.emit('connectionFailed');
        }
    }
    handleRecognitionResult(result) {
        if (result.mode === '2pass-offline') {
            if (result.text) {
                console.log(`[离线识别] ${result.text}`);
                this.emit('recognitionComplete', result);
            }
        }
        else if (result.mode === '2pass-online' && result.text) {
            this.emit('recognitionComplete', result);
        }
    }
    sendAudio(chunk) {
        if (!this.ws || !this.isConnected()) {
            console.warn('WebSocket 未连接，无法发送音频数据');
            return;
        }
        try {
            this.ws.send(chunk);
        }
        catch (error) {
            console.error('发送音频数据失败:', error);
            this.handleDisconnect();
        }
    }
    close() {
        this.reconnectAttempts = this.maxReconnectAttempts; // 停止重连
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws && this.isConnected()) {
            try {
                this.ws.send(JSON.stringify({ is_speaking: false }));
                this.ws.close(1000, '正常关闭');
            }
            catch (error) {
                console.error('关闭连接失败:', error);
            }
        }
        this.isInitialized = false;
    }
    isConnected() {
        return this.ws && this.ws.readyState === ws_1.default.OPEN;
    }
}
exports.VoiceRecognition = VoiceRecognition;
