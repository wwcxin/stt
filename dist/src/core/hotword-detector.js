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
exports.HotwordDetector = void 0;
const porcupine_node_1 = require("@picovoice/porcupine-node");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class HotwordDetector {
    constructor(config) {
        this.porcupine = null;
        this.config = config;
    }
    async initialize() {
        try {
            const modelPath = path.resolve(process.cwd(), this.config.modelPath);
            if (!fs.existsSync(modelPath)) {
                throw new Error(`找不到模型文件: ${modelPath}`);
            }
            const keywordPaths = [];
            const sensitivities = [];
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
            this.porcupine = new porcupine_node_1.Porcupine('oUrzqSj688RjE5emQWgBa7z6foXSVYlZBsZk47gZJhdQ1yhyH5b1dQ==', keywordPaths, sensitivities, modelPath);
            console.log('热词检测初始化成功');
        }
        catch (error) {
            console.error('热词检测初始化失败:', error);
            throw error;
        }
    }
    processFrame(frame) {
        if (!this.porcupine) {
            throw new Error('热词检测器未初始化');
        }
        return this.porcupine.process(frame);
    }
    release() {
        if (this.porcupine) {
            this.porcupine.release();
            this.porcupine = null;
        }
    }
    get frameLength() {
        if (!this.porcupine) {
            throw new Error('热词检测器未初始化');
        }
        return this.porcupine.frameLength;
    }
}
exports.HotwordDetector = HotwordDetector;
