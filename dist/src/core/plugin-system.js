"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginSystem = void 0;
const events_1 = require("events");
class PluginSystem {
    constructor() {
        this.plugins = new Map();
        this.eventBus = new events_1.EventEmitter();
    }
    async loadPlugin(name, config) {
        try {
            const plugin = require(config.path).default;
            if (plugin.onLoad) {
                await plugin.onLoad();
            }
            this.plugins.set(name, plugin);
            console.log(`插件 ${name} 加载成功`);
        }
        catch (error) {
            console.error(`插件 ${name} 加载失败:`, error);
        }
    }
    emit(event, data) {
        this.eventBus.emit(event, data);
    }
    async handleEvent(event) {
        for (const [name, plugin] of this.plugins.entries()) {
            try {
                await plugin.handle(event);
            }
            catch (error) {
                console.error(`插件 ${name} 处理事件失败:`, error);
            }
        }
    }
    async handleHotwordDetection() {
        for (const [name, plugin] of this.plugins.entries()) {
            if (plugin.onHotwordDetected) {
                try {
                    await plugin.onHotwordDetected();
                }
                catch (error) {
                    console.error(`插件 ${name} 处理热词检测失败:`, error);
                }
            }
        }
    }
    async handleAudioData(audioData) {
        for (const [name, plugin] of this.plugins.entries()) {
            if (plugin.onAudioData) {
                try {
                    await plugin.onAudioData(audioData);
                }
                catch (error) {
                    console.error(`插件 ${name} 处理音频失败:`, error);
                }
            }
        }
    }
    async unloadAll() {
        for (const [name, plugin] of this.plugins.entries()) {
            if (plugin.onUnload) {
                try {
                    await plugin.onUnload();
                }
                catch (error) {
                    console.error(`插件 ${name} 卸载失败:`, error);
                }
            }
        }
        this.plugins.clear();
    }
}
exports.PluginSystem = PluginSystem;
