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
exports.PluginLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../utils/config");
class PluginLoader {
    constructor() {
        this.plugins = new Map();
        this.pluginWatchers = new Map();
    }
    async loadPlugins() {
        const config = config_1.ConfigManager.getInstance().getConfig();
        for (const pluginName of config.plugins) {
            await this.loadPlugin(pluginName);
        }
    }
    async loadPlugin(pluginName) {
        const pluginPath = path.join(process.cwd(), 'plugins', pluginName);
        const indexPath = path.join(pluginPath, 'index.ts');
        try {
            // 清除 require 缓存以支持热重载
            delete require.cache[require.resolve(indexPath)];
            const plugin = require(indexPath).default;
            // 验证插件接口
            if (!plugin || typeof plugin.handle !== 'function') {
                throw new Error(`插件 ${pluginName} 格式不正确：缺少 handle 方法`);
            }
            if (plugin.onLoad) {
                await plugin.onLoad();
            }
            this.plugins.set(pluginName, plugin);
            console.log(`插件 ${pluginName} 加载成功`);
            // 设置文件监听
            this.watchPlugin(pluginName, indexPath);
        }
        catch (error) {
            console.error(`加载插件 ${pluginName} 失败:`, error);
        }
    }
    watchPlugin(pluginName, pluginPath) {
        var _a;
        // 移除旧的监听器
        if (this.pluginWatchers.has(pluginName)) {
            (_a = this.pluginWatchers.get(pluginName)) === null || _a === void 0 ? void 0 : _a.close();
        }
        const watcher = fs.watch(pluginPath, async (eventType) => {
            if (eventType === 'change') {
                console.log(`检测到插件 ${pluginName} 变更，正在重新加载...`);
                await this.reloadPlugin(pluginName);
            }
        });
        this.pluginWatchers.set(pluginName, watcher);
    }
    async reloadPlugin(pluginName) {
        const oldPlugin = this.plugins.get(pluginName);
        if (oldPlugin === null || oldPlugin === void 0 ? void 0 : oldPlugin.onUnload) {
            await oldPlugin.onUnload();
        }
        await this.loadPlugin(pluginName);
    }
    async handleEvent(event) {
        for (const [pluginName, plugin] of this.plugins.entries()) {
            try {
                if (typeof plugin.handle === 'function') {
                    await plugin.handle(event);
                }
                else {
                    console.error(`插件 ${pluginName} 缺少 handle 方法`);
                }
            }
            catch (error) {
                console.error(`插件 ${pluginName} 处理事件失败:`, error);
            }
        }
    }
    async unloadAll() {
        var _a;
        for (const [pluginName, plugin] of this.plugins.entries()) {
            if (plugin.onUnload) {
                await plugin.onUnload();
            }
            (_a = this.pluginWatchers.get(pluginName)) === null || _a === void 0 ? void 0 : _a.close();
        }
        this.plugins.clear();
        this.pluginWatchers.clear();
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
}
exports.PluginLoader = PluginLoader;
