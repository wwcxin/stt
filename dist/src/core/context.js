"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
/**
 * 上下文管理类
 * 提供全局状态和便捷方法的单例类
 */
class Context {
    constructor() {
        /** 当前识别事件 */
        this.currentEvent = null;
        /** 是否触发了关键词 */
        this.isKeywordTriggered = false;
        /** 关键词集合 */
        this.keywords = new Set(['雪豹']);
    }
    /**
     * 获取 Context 单例实例
     * @returns Context 实例
     */
    static getInstance() {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        return Context.instance;
    }
    /**
     * 设置当前识别事件
     * @param event 识别事件对象，可以为 null
     */
    setEvent(event) {
        this.currentEvent = event;
    }
    /**
     * 设置关键词触发状态
     * @param triggered 是否触发
     */
    setKeywordTriggered(triggered) {
        this.isKeywordTriggered = triggered;
    }
    /**
     * 获取完整的识别文本
     * @returns 识别的完整文本，如果没有则返回空字符串
     */
    get text() {
        var _a;
        return ((_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.text) || '';
    }
    /**
     * 获取去除关键词的文本
     * 将所有已知的关键词从文本中移除
     * @returns 处理后的文本
     */
    getText() {
        var _a;
        if (!((_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.text))
            return '';
        let text = this.currentEvent.text;
        for (const keyword of this.keywords) {
            text = text.replace(keyword, '').trim();
        }
        return text;
    }
    /**
     * 是否触发了关键词
     * 用于判断是声音匹配还是文本匹配触发的关键词
     * @returns true 表示触发了关键词
     */
    get isKT() {
        return this.isKeywordTriggered;
    }
    /**
     * 获取识别模式
     * @returns 识别模式字符串，可能是 '2pass-online' 或 '2pass-offline'
     */
    get mode() {
        var _a;
        return ((_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.mode) || '';
    }
    /**
     * 是否是离线识别结果
     * @returns true 表示是离线（更准确）的识别结果
     */
    get isOffline() {
        var _a;
        return ((_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.mode) === '2pass-offline';
    }
    /**
     * 获取时间戳信息
     * @returns 时间戳字符串，可能为 undefined
     */
    get timestamp() {
        var _a;
        return (_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.timestamp;
    }
    /**
     * 获取分段识别结果
     * @returns 分段识别结果数组，包含时间戳和文本信息
     */
    get segments() {
        var _a, _b;
        return ((_b = (_a = this.currentEvent) === null || _a === void 0 ? void 0 : _a.stamp_sents) === null || _b === void 0 ? void 0 : _b.map(sent => ({
            start: sent.start,
            end: sent.end,
            text: sent.text_seg,
            punc: sent.punc
        }))) || [];
    }
    /**
     * 重置上下文状态
     * 清除当前事件和关键词触发状态
     */
    reset() {
        this.currentEvent = null;
        this.isKeywordTriggered = false;
    }
    /**
     * 添加关键词
     * @param keyword 要添加的关键词
     */
    addKeyword(keyword) {
        this.keywords.add(keyword);
    }
    /**
     * 移除关键词
     * @param keyword 要移除的关键词
     */
    removeKeyword(keyword) {
        this.keywords.delete(keyword);
    }
    /**
     * 获取所有关键词
     * @returns 关键词数组
     */
    getKeywords() {
        return Array.from(this.keywords);
    }
    /**
     * 检查文本是否包含任何关键词
     * @param text 要检查的文本
     * @returns true 表示包含关键词
     */
    hasKeyword(text) {
        return Array.from(this.keywords).some(keyword => text.includes(keyword));
    }
}
exports.Context = Context;
