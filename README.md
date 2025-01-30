# NapCat Bot

[English](docs/README_en-US.md) | [简体中文](docs/README_zh-CN.md)

A QQ group chat bot based on [NapCatQQ](https://github.com/NapNeko/NapCatQQ) and [node-napcat-ts](https://github.com/huankong-team/node-napcat-ts), supporting multiple AI models for conversation.

[View Documentation →](docs/README_en-US.md)

## Features

- Multi-model Support: Integrates multiple AI models including Spark and DeepSeek
- Dynamic Switching: Switch between different AI models on the fly
- Prompt Customization: Set independent system prompts for each model
- User-Friendly: Intuitive command system for quick start

### Prerequisites
Before using NapCat Bot, you need to install [NapCatQQ](https://github.com/NapNeko/NapCatQQ). Follow the installation instructions provided in the NapCatQQ repository.

## Quick Start

```bash
# Clone and install
git clone https://github.com/wenxin1114/napcat-bot.git
cd napcat-bot
pnpm install

# Configure
cp .env.example .env

# Run
node main.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Wenxin - [@wenxin1114](https://github.com/wenxin1114)
