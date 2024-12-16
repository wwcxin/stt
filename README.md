# STT (Speech To Text)

一个基于 FunASR 和 Porcupine 的语音识别框架，支持实时语音识别和关键词检测。

## 功能特点

- 实时语音识别（基于 FunASR）
  - 支持 2pass/online/offline 三种模式
  - 支持逆文本标准化（ITN）
  - 支持热词权重配置
  
- 本地关键词检测（基于 Porcupine）
  - 低延迟的本地语音唤醒
  - 支持自定义关键词
  - 可调节的灵敏度设置

- 插件系统
  - 支持热插拔
  - 事件驱动
  - 上下文管理（ctx）

- 其他特性
  - 完整的类型支持
  - 日志系统
  - 配置管理
  - 错误处理

## 前置要求

- Node.js >= 14.0.0
- FunASR 服务器
- Porcupine 访问密钥
- 麦克风设备
- sox === "14.4.1"

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/wwcxin/stt.git
cd stt
```

2. 安装依赖：

```bash
npm install
```

3. 配置文件：
- 配置accessKey `config/asr.config.toml`
- 修改配置文件中的服务器地址和其他参数

## 使用方法

1. 启动开发环境：

```bash
npm run dev
```

2. 可用命令：
- `start` - 开始录音
- `stop` - 停止录音
- `reload` - 重新加载插件
- `results` - 显示所有结果
- `exit` - 退出程序

## 配置文件说明

```toml
plugins = [ "关键词" ] # 启用的插件列表
mode = "2pass" # 识别模式：2pass/online/offline
itn = true # 是否启用逆文本标准化
FunASR 热词配置
[hotwords]
"雪豹" = { score = 20 }
"hello world" = { score = 40 }
Porcupine 热词配置
[porcupineHotwords]
snowleopard = { path = "assets/keywords/zh/雪豹.ppn", sensitivity = 0.5 }
服务器配置
[server]
host = "192.168.10.102"
port = 10095
音频配置
[audio]
sampleRate = 16000
channels = 1
bitDepth = 16
frameLength = 512
chunkSize = [5, 10, 5]
chunkInterval = 10
Porcupine 模型配置
[models.porcupine]
language = "zh"
path = "assets/models/porcupine_params_zh.pv"
accessKey = ""
```

## 插件开发

### 插件结构

```typescript
import { Plugin, RecognitionEvent } from '../../types';
import { Context } from '../../core/context';
export default {
name: '插件名称',
version: '1.0.0',
description: '插件描述',
author: '作者',
async onLoad() {
// 插件加载时执行
},
async onHotwordDetected() {
const ctx = Context.getInstance();
if (ctx.isKT) {
// 处理热词检测
}
},
async handle(event: RecognitionEvent) {
const ctx = Context.getInstance();
if (ctx.isOffline) {
// 处理识别结果
console.log(识别文本: ${ctx.text});
console.log(去除关键词: ${ctx.getText()});
}
},
async onUnload() {
// 插件卸载时执行
}
} as Plugin;
```

### ctx API
- `ctx.text` - 获取完整识别文本
- `ctx.getText()` - 获取去除关键词的文本
- `ctx.isKT` - 是否触发关键词检测
- `ctx.isOffline` - 是否是离线识别结果
- `ctx.mode` - 获取识别模式
- `ctx.timestamp` - 获取时间戳

## 目录结构
```
stt/
├── assets/ # 资源文件
│ ├── models/ # 模型文件
│ │ └── porcupine/ # Porcupine 模型
│ └── keywords/ # 关键词文件
│ └── zh/ # 中文关键词
├── config/ # 配置文件
├── src/ # 源代码
│ ├── core/ # 核心功能
│ ├── plugins/ # 插件目录
│ ├── types/ # 类型定义
│ └── utils/ # 工具函数
├── logs/ # 日志文件
└── types/ # 第三方库类型定义
```
## 常见问题

1. WebSocket 连接失败
   - 检查 FunASR 服务器是否运行
   - 验证服务器地址和端口配置
   - 确认网络连接正常

2. 关键词检测问题
   - 确认 Porcupine 访问密钥有效
   - 检查模型文件和关键词文件路径
   - 调整灵敏度参数

3. 音频录制问题
   - 检查`sox`版本是否为`14.4.1`
   - 检查麦克风权限
   - 确认音频设备正常工作
   - 验证音频参数配置

## 开发计划

- [ ] 支持更多语音识别引擎
- [ ] 添加 GUI 界面
- [ ] 优化插件热重载机制
- [ ] 添加更多示例插件
- [ ] 完善错误处理机制

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 许可证

MIT License

## 鸣谢

- [FunASR](https://github.com/alibaba-damo-academy/FunASR)
- [Picovoice Porcupine](https://picovoice.ai/platform/porcupine/)

