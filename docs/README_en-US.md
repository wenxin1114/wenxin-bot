# NapCat Bot

A QQ group chat bot based on [NapCatQQ](https://github.com/NapNeko/NapCatQQ) and [node-napcat-ts](https://github.com/huankong-team/node-napcat-ts), supporting multiple AI models for conversation.

## Features

- Multi-model Support: Integrates multiple AI models including Spark and DeepSeek
- Dynamic Switching: Switch between different AI models on the fly
- Prompt Customization: Set independent system prompts for each model
- User-Friendly: Intuitive command system for quick start

### Prerequisites
Before using NapCat Bot, you need to install [NapCatQQ](https://github.com/NapNeko/NapCatQQ). Follow the installation instructions provided in the NapCatQQ repository.

## Quick Start

### 1. Installation
```bash
# Clone the project
git clone https://github.com/yourusername/napcat-bot.git
cd napcat-bot

# Install dependencies
pnpm install
```

### 2. Configuration
```bash
# Copy configuration file
cp .env.example .env
```

Edit `.env` file with your configurations:
```env
# Spark API Key
SPARK_API_KEY=YOUR_SPARK_API_KEY

# DeepSeek API Key
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY

# NapCat Bot Access Token
NAPCAT_ACCESS_TOKEN=YOUR_NAPCAT_ACCESS_TOKEN
```

### 3. Run
```bash
node main.js
```

## Usage Guide

### Basic Commands
- `/menu` - Display all available commands
- `/model` - View current model status
- `/ask <content>` - Ask the current model a question

### Model Management
```
# View model list and current status
/model

# Switch to specific model
/model spark

# Switch model and set system prompt
/model deepSeek You are a cute catgirl assistant
```

### Example Conversation
```
User: /model
Bot: ===== Models =====
     *spark
      deepSeek
      
     System Prompt: You are a knowledgeable friend...

User: /ask How's the weather today?
Bot: Sorry, as an AI assistant, I can't access real-time weather information...
```

## Project Structure
```
napcat-bot/
├── main.js              # Entry point
├── config.js            # Configuration management
├── utils/
│   ├── ModelManager.js  # Model manager
│   └── CommandHandler.js# Command handler
├── .env                 # Environment config (create your own)
└── .env.example         # Environment config example
```

## Supported Models

| Model Name | Description | Config Item |
|------------|-------------|-------------|
| spark | iFLYTEK Spark Cognitive Model | SPARK_API_KEY |
| deepSeek | DeepSeek AI | DEEPSEEK_API_KEY |

## Dependencies

- `node-napcat-ts`: QQ Bot Framework
- `openai`: DeepSeek API Client
- `dotenv`: Environment Variable Management
- `ws`: WebSocket Client

## Roadmap

- [ ] Support more AI models
- [ ] Add conversation history
- [ ] Support multi-turn dialogue
- [ ] Add permission management system

## Contributing

1. Fork the project
2. Create your feature branch `git checkout -b feature/amazing-feature`
3. Commit your changes `git commit -m 'Add amazing feature'`
4. Push to the branch `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details

## Author

Wenxin - [@wenxin1114](https://github.com/wenxin1114)

## Acknowledgments

This project is based on:

- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - A modern Bot protocol implementation based on NTQQ
- [node-napcat-ts](https://github.com/huankong-team/node-napcat-ts) - Node.js SDK for NapCat
- [iFLYTEK Spark](https://xinghuo.xfyun.cn/)
- [DeepSeek AI](https://deepseek.com/)

Special thanks to [NapNeko](https://github.com/NapNeko) team and [huankong-team](https://github.com/huankong-team) for their open source contributions. 