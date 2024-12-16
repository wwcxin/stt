import { Plugin, RecognitionEvent } from '../../types';
import { Context } from '../../core/context';

export default {
  name: '关键词',
  version: '1.0.0',
  description: '语音关键词检测插件',
  author: 'Your Name',

  async onLoad() {
    console.log('关键词插件已加载');
  },

  async onHotwordDetected() {
    const ctx = Context.getInstance();
    if (ctx.isKT) {
      console.log(`[声音匹配] 检测到关键词: 雪豹`);
    }
  },

  async handle(event: RecognitionEvent) {
    const ctx = Context.getInstance();
    if (ctx.isOffline && ctx.text.includes('雪豹')) {
      console.log(`[文本匹配] 检测到关键词: 雪豹`);
      console.log(`[文本内容] ${ctx.getText()}`);  // 输出去除关键词的内容
    }
  },

  async onUnload() {
    console.log('关键词插件已卸载');
  }
} as Plugin;
