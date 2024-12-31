# NapCat Bot

一个基于 [NapCatQQ](https://github.com/NapNeko/NapCatQQ) 和 [node-napcat-ts](https://github.com/huankong-team/node-napcat-ts) 的 QQ 群聊机器人，支持多个 AI 模型的对话。

## 功能特性

- 多模型支持：集成星火认知、DeepSeek 等多个 AI 模型
- 动态切换：随时切换不同的 AI 模型
- 提示词定制：支持为每个模型设置独立的系统提示词
- 简单易用：直观的命令系统，快速上手

## 快速开始

### 1. 安装
```bash
# 克隆项目
git clone https://github.com/yourusername/napcat-bot.git
cd napcat-bot

# 安装依赖
pnpm install
```

### 2. 配置
```bash
# 复制配置文件
cp .env.example .env
```

编辑 `.env` 文件，填入以下配置：
```env
# 星火认知 API 密钥
SPARK_API_KEY=YOUR_SPARK_API_KEY

# DeepSeek API 密钥
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# NapCat 机器人访问令牌
NAPCAT_ACCESS_TOKEN=YOUR_NAPCAT_ACCESS_TOKEN
```

### 3. 运行
```bash
node main.js
```

## 使用指南

### 基础命令
- `/菜单` - 显示所有可用命令
- `/模型` - 查看当前模型状态
- `/问 <内容>` - 向当前模型提问

### 模型管理
```
# 查看模型列表和当前状态
/模型

# 切换到指定模型
/模型 spark

# 切换模型并设置系统提示词
/模型 deepSeek 你是一个可爱的猫娘助手
```

### 示例对话
```
User: /模型
Bot: ===== 模型 =====
     *spark
      deepSeek
      
      系统提示：你是一个知识渊博的群友...

User: /问 今天天气怎么样？
Bot: 抱歉，我是AI助手，无法直接获取实时天气信息...
```

## 项目结构
```
napcat-bot/
├── main.js              # 入口文件
├── config.js            # 配置管理
├── utils/
│   ├── ModelManager.js  # 模型管理器
│   └── CommandHandler.js# 命令处理器
├── .env                 # 环境配置（需自行创建）
└── .env.example         # 环境配置示例
```

## 支持的模型

| 模型名称 | 描述 | 配置项 |
|---------|------|--------|
| spark | 讯飞星火认知大模型 | SPARK_API_KEY |
| deepSeek | DeepSeek AI | DEEPSEEK_API_KEY |

## 依赖项

- `node-napcat-ts`: QQ 机器人框架
- `openai`: DeepSeek API 客户端
- `dotenv`: 环境变量管理
- `ws`: WebSocket 客户端

## 开发计划

- [ ] 支持更多 AI 模型
- [ ] 添加对话历史记录
- [ ] 支持多轮对话
- [ ] 添加权限管理系统

## 贡献指南

1. Fork 本项目
2. 创建新分支 `git checkout -b feature/amazing-feature`
3. 提交更改 `git commit -m 'Add amazing feature'`
4. 推送到分支 `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 作者

你的名字 - [@你的GitHub用户名](https://github.com/yourusername)

## 致谢

本项目基于以下开源项目开发：

- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - 现代化的基于 NTQQ 的 Bot 协议端实现
- [node-napcat-ts](https://github.com/huankong-team/node-napcat-ts) - NapCat 的 Node.js SDK
- [讯飞星火认知大模型](https://xinghuo.xfyun.cn/)
- [DeepSeek AI](https://deepseek.com/)

特别感谢 [NapNeko](https://github.com/NapNeko) 团队和 [huankong-team](https://github.com/huankong-team) 的开源贡献。
