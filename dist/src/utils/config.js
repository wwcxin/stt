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
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const TOML = __importStar(require("@iarna/toml"));
class ConfigManager {
    constructor() {
        try {
            const configPath = './config/asr.config.toml';
            const configFile = fs.readFileSync(configPath, 'utf-8');
            const parsedConfig = TOML.parse(configFile);
            // 验证并转换配置
            this.validateConfig(parsedConfig);
            this.config = parsedConfig;
        }
        catch (error) {
            console.error('配置加载失败:', error);
            throw new Error('配置初始化失败');
        }
    }
    validateConfig(config) {
        var _a;
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
        if (!((_a = config.models) === null || _a === void 0 ? void 0 : _a.porcupine) || !this.validatePorcupineConfig(config.models.porcupine)) {
            throw new Error('配置错误: porcupine 配置不完整');
        }
    }
    validateAudioConfig(audio) {
        return (typeof audio.sampleRate === 'number' &&
            typeof audio.channels === 'number' &&
            typeof audio.bitDepth === 'number' &&
            typeof audio.frameLength === 'number');
    }
    validatePorcupineConfig(porcupine) {
        return (typeof porcupine.language === 'string' &&
            typeof porcupine.path === 'string');
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
}
exports.ConfigManager = ConfigManager;
