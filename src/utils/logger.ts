import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

export class Logger {
  private static instance: Logger;
  private logStream: fs.WriteStream;
  private logFile: string;

  private constructor() {
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

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = util.format(...args);
    this.logStream.write(`[${timestamp}] ${level}: ${message}\n`);
  }

  public close() {
    this.logStream.end();
  }
} 