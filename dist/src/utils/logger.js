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
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
class Logger {
    constructor() {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        this.logFile = path.join('logs', `${timestamp}.log`);
        this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
        // 重定向 console.log 等输出到文件
        const oldConsole = { ...console };
        console.log = (...args) => {
            this.log('INFO', ...args);
            oldConsole.log(...args);
        };
        console.error = (...args) => {
            this.log('ERROR', ...args);
            oldConsole.error(...args);
        };
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    log(level, ...args) {
        const timestamp = new Date().toISOString();
        const message = util.format(...args);
        this.logStream.write(`[${timestamp}] ${level}: ${message}\n`);
    }
    close() {
        this.logStream.end();
    }
}
exports.Logger = Logger;