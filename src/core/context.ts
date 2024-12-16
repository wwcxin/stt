import { RecognitionEvent } from '../types';

/**
 * 上下文管理类
 * 提供全局状态和便捷方法的单例类
 */
export class Context {
  private static instance: Context;
  /** 当前识别事件 */
  private currentEvent: RecognitionEvent | null = null;
  /** 是否触发了关键词 */
  private isKeywordTriggered: boolean = false;
  /** 关键词集合 */
  private keywords: Set<string> = new Set(['雪豹']);

  private constructor() {}

  /**
   * 获取 Context 单例实例
   * @returns Context 实例
   */
  public static getInstance(): Context {
    if (!Context.instance) {
      Context.instance = new Context();
    }
    return Context.instance;
  }

  /**
   * 设置当前识别事件
   * @param event 识别事件对象，可以为 null
   */
  public setEvent(event: RecognitionEvent | null): void {
    this.currentEvent = event;
  }

  /**
   * 设置关键词触发状态
   * @param triggered 是否触发
   */
  public setKeywordTriggered(triggered: boolean): void {
    this.isKeywordTriggered = triggered;
  }

  /**
   * 获取完整的识别文本
   * @returns 识别的完整文本，如果没有则返回空字符串
   */
  public get text(): string {
    return this.currentEvent?.text || '';
  }

  /**
   * 获取去除关键词的文本
   * 将所有已知的关键词从文本中移除
   * @returns 处理后的文本
   */
  public getText(): string {
    if (!this.currentEvent?.text) return '';
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
  public get isKT(): boolean {
    return this.isKeywordTriggered;
  }

  /**
   * 获取识别模式
   * @returns 识别模式字符串，可能是 '2pass-online' 或 '2pass-offline'
   */
  public get mode(): string {
    return this.currentEvent?.mode || '';
  }

  /**
   * 是否是离线识别结果
   * @returns true 表示是离线（更准确）的识别结果
   */
  public get isOffline(): boolean {
    return this.currentEvent?.mode === '2pass-offline';
  }

  /**
   * 获取时间戳信息
   * @returns 时间戳字符串，可能为 undefined
   */
  public get timestamp(): string | undefined {
    return this.currentEvent?.timestamp;
  }

  /**
   * 获取分段识别结果
   * @returns 分段识别结果数组，包含时间戳和文本信息
   */
  public get segments(): Array<{
    start: number;  // 开始时间（毫秒）
    end: number;    // 结束时间（毫秒）
    text: string;   // 分段文本
    punc: string;   // 标点符号
  }> {
    return this.currentEvent?.stamp_sents?.map(sent => ({
      start: sent.start,
      end: sent.end,
      text: sent.text_seg,
      punc: sent.punc
    })) || [];
  }

  /**
   * 重置上下文状态
   * 清除当前事件和关键词触发状态
   */
  public reset(): void {
    this.currentEvent = null;
    this.isKeywordTriggered = false;
  }

  /**
   * 添加关键词
   * @param keyword 要添加的关键词
   */
  public addKeyword(keyword: string): void {
    this.keywords.add(keyword);
  }

  /**
   * 移除关键词
   * @param keyword 要移除的关键词
   */
  public removeKeyword(keyword: string): void {
    this.keywords.delete(keyword);
  }

  /**
   * 获取所有关键词
   * @returns 关键词数组
   */
  public getKeywords(): string[] {
    return Array.from(this.keywords);
  }

  /**
   * 检查文本是否包含任何关键词
   * @param text 要检查的文本
   * @returns true 表示包含关键词
   */
  public hasKeyword(text: string): boolean {
    return Array.from(this.keywords).some(keyword => text.includes(keyword));
  }
} 