import { VoiceRecognitionFramework } from './core/framework';
import { Logger } from './utils/logger';

async function main() {
  try {
    // 初始化日志系统
    const logger = Logger.getInstance();
    
    // 初始化框架
    const framework = VoiceRecognitionFramework.getInstance();
    await framework.initialize();

    // 处理用户输入
    process.stdin.on('data', (data) => {
      const input = data.toString().trim();
      switch (input) {
        case 'start':
          framework.startRecording();
          break;
        case 'stop':
          framework.stopRecording();
          break;
        case 'reload':
          framework.reloadPlugins();
          break;
        case 'results':
          console.log('所有识别结果:', framework.getResults());
          break;
        case 'exit':
          framework.close();
          logger.close();
          process.exit(0);
          break;
        default:
          console.log('未知命令:', input);
      }
    });

    console.log('输入命令控制录音：');
    console.log('start   - 开始录音');
    console.log('stop    - 停止录音');
    console.log('reload  - 重新加载插件');
    console.log('results - 显示所有结果');
    console.log('exit    - 退出程序');
  } catch (error) {
    console.error('程序初始化失败:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('主程序异常:', error);
  process.exit(1);
}); 