import * as fs from 'fs';
import * as path from 'path';
import { Plugin } from '../types';
import { ConfigManager } from '../utils/config';

export class PluginLoader {
  private plugins: Map<string, Plugin> = new Map();
  private pluginWatchers: Map<string, fs.FSWatcher> = new Map();

  async loadPlugins(): Promise<void> {
    const config = ConfigManager.getInstance().getConfig();
    
    for (const pluginName of config.plugins) {
      await this.loadPlugin(pluginName);
    }
  }

  private async loadPlugin(pluginName: string): Promise<void> {
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
    } catch (error) {
      console.error(`加载插件 ${pluginName} 失败:`, error);
    }
  }

  private watchPlugin(pluginName: string, pluginPath: string): void {
    // 移除旧的监听器
    if (this.pluginWatchers.has(pluginName)) {
      this.pluginWatchers.get(pluginName)?.close();
    }

    const watcher = fs.watch(pluginPath, async (eventType) => {
      if (eventType === 'change') {
        console.log(`检测到插件 ${pluginName} 变更，正在重新加载...`);
        await this.reloadPlugin(pluginName);
      }
    });

    this.pluginWatchers.set(pluginName, watcher);
  }

  private async reloadPlugin(pluginName: string): Promise<void> {
    const oldPlugin = this.plugins.get(pluginName);
    if (oldPlugin?.onUnload) {
      await oldPlugin.onUnload();
    }
    
    await this.loadPlugin(pluginName);
  }

  async handleEvent(event: any): Promise<void> {
    for (const [pluginName, plugin] of this.plugins.entries()) {
      try {
        if (typeof plugin.handle === 'function') {
          await plugin.handle(event);
        } else {
          console.error(`插件 ${pluginName} 缺少 handle 方法`);
        }
      } catch (error) {
        console.error(`插件 ${pluginName} 处理事件失败:`, error);
      }
    }
  }

  async unloadAll(): Promise<void> {
    for (const [pluginName, plugin] of this.plugins.entries()) {
      if (plugin.onUnload) {
        await plugin.onUnload();
      }
      this.pluginWatchers.get(pluginName)?.close();
    }
    
    this.plugins.clear();
    this.pluginWatchers.clear();
  }

  public getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
} 