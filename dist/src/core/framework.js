"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceRecognitionFramework = void 0;
const events_1 = require("events");
const plugin_system_1 = require("./plugin-system");
const voice_recognition_1 = require("./voice-recognition");
const config_1 = require("../utils/config");
const audio_processor_1 = require("./audio-processor");
const hotword_detector_1 = require("./hotword-detector");
const record = __importStar(require("node-record-lpcm16"));
const path = __importStar(require("path"));
const context_1 = require("./context");
class VoiceRecognitionFramework extends events_1.EventEmitter {
    static getInstance() {
        if (!VoiceRecognitionFramework.instance) {
            VoiceRecognitionFramework.instance = new VoiceRecognitionFramework();
        }
        return VoiceRecognitionFramework.instance;
    }
    constructor() {
        super();
        this.recognitionResults = [];
        this.recorder = null;
        this.isRecording = false;
        this.logOptions = {
            showRealtime: false, // 不显示实时识别结果
            showOffline: true, // 显示离线识别结果
            showHotwords: true // 显示热词检测结果
        };
        this.config = config_1.ConfigManager.getInstance().getConfig();
        this.initComponents();
    }
    initComponents() {
        // 初始化音频处理器
        const audioConfig = {
            sampleRate: this.config.audio.sampleRate,
            channels: this.config.audio.channels,
            bitDepth: this.config.audio.bitDepth,
            frameLength: this.config.audio.frameLength
        };
        this.audioProcessor = new audio_processor_1.AudioProcessor(audioConfig);
        // 初始化热词检测器
        const hotwordConfig = {
            modelPath: this.config.models.porcupine.path,
            keywords: this.config.porcupineHotwords
        };
        this.hotwordDetector = new hotword_detector_1.HotwordDetector(hotwordConfig);
        // 初始化语音识别
        const serverUrl = `ws://${this.config.server.host}:${this.config.server.port}`;
        this.recognition = new voice_recognition_1.VoiceRecognition(serverUrl);
        // 初始化插件系统
        this.pluginSystem = new plugin_system_1.PluginSystem();
        // 设置事件处理
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        const ctx = context_1.Context.getInstance();
        this.recognition.on('recognitionComplete', async (event) => {
            this.recognitionResults.push(event);
            // 更新 Context
            ctx.setEvent(event);
            await this.pluginSystem.handleEvent(event);
            // 重置 Context
            ctx.reset();
        });
    }
    async initialize() {
        try {
            // 初始化热词检测
            await this.hotwordDetector.initialize();
            console.log('热词检测初始化成功');
            // 加载插件
            await this.loadPlugins();
            console.log('插件加载完成');
        }
        catch (error) {
            console.error('初始化失败:', error);
            throw error;
        }
    }
    async loadPlugins() {
        for (const pluginName of this.config.plugins) {
            try {
                const pluginConfig = {
                    name: pluginName,
                    path: path.join(__dirname, '..', '..', 'src', 'plugins', pluginName)
                };
                await this.pluginSystem.loadPlugin(pluginName, pluginConfig);
            }
            catch (error) {
                console.error(`加载插件 ${pluginName} 失败:`, error);
            }
        }
    }
    async processAudio(chunk) {
        try {
            const ctx = context_1.Context.getInstance();
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
            }
            else if (Math.random() < 0.01) {
                console.warn('语音识别服务未连接');
            }
        }
        catch (error) {
            console.error('音频处理失败:', error);
        }
    }
    startRecording() {
        if (this.isRecording)
            return;
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
            stream.on('data', async (chunk) => {
                await this.processAudio(chunk);
            });
            stream.on('error', (error) => {
                console.error('录音错误:', error);
                this.stopRecording();
            });
            console.log('开始录音...');
        }
        catch (error) {
            console.error('启动录音失败:', error);
            this.isRecording = false;
        }
    }
    stopRecording() {
        if (!this.isRecording)
            return;
        this.isRecording = false;
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = null;
        }
    }
    async reloadPlugins() {
        await this.pluginSystem.unloadAll();
        await this.loadPlugins();
    }
    getResults() {
        return this.recognitionResults;
    }
    close() {
        this.stopRecording();
        this.hotwordDetector.release();
        this.recognition.close();
        this.pluginSystem.unloadAll();
    }
    setLogOptions(options) {
        Object.assign(this.logOptions, options);
    }
}
exports.VoiceRecognitionFramework = VoiceRecognitionFramework;
