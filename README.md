# Wenxin Bot

[English](./README_EN.md) | 简体中文

⚠️ **注意**: 本项目需要先安装 NapCatQQ。请在继续下面的步骤前确保已安装 NapCatQQ。

基于 NapCatQQ 和 node-napcat-ts 的 QQ 群聊机器人，支持多个 AI 模型对话。

[查看文档 →](./docs/README_zh-CN.md)

## 功能特性

* 多模型支持：集成多个 AI 模型，包括讯飞星火和 DeepSeek
* 动态切换：支持实时切换不同的 AI 模型
* 提示词定制：为每个模型设置独立的系统提示词
* 图片生成：支持将 AI 回复转换为图片
* 历史记录：支持查看和清除聊天历史
* 抖音解析：支持解析抖音视频链接
* 热搜榜单：支持查看知乎/微博热搜
* 每日新闻：获取每日新闻资讯

### 命令列表

* `/问 <内容>` - 向当前模型提问
* `/图问 <内容>` - 以图片方式显示 AI 回答
* `/模型` - 查看当前模型状态
* `/切换 <模型名称>` - 切换 AI 模型
* `/提示词 <内容>` - 设置模型系统提示词
* `/历史` - 查看聊天记录
* `/清除` - 清除对话历史记录
* `/抖音解析` - 解析抖音视频
* `/知乎热搜` - 查看知乎热搜榜
* `/微博热搜` - 查看微博热搜榜
* `/新闻` - 查看每日新闻
* `/菜单` - 显示命令菜单

### 环境要求

在使用 Wenxin Bot 之前，你需要：

1. 安装 NapCatQQ
2. Node.js 18.0.0 或更高版本
3. pnpm 包管理器

## 快速开始

```bash
# 克隆并安装
git clone https://github.com/wenxin1114/wenxin-bot.git
cd wenxin-bot
pnpm install

# 配置
cp .env.example .env
# 编辑 .env 文件，填写必要的配置项

# 配置说明

在 `.env` 文件中配置以下必要参数：

* `BOT_NAME`: 机器人名称
* `BOT_MASTER`: 管理员QQ号
* `NAPCAT_HOST`: NapCat服务器地址
* `NAPCAT_TOKEN`: NapCat访问令牌
* `SPARK_API_KEY`: 讯飞星火API密钥
* `DEEPSEEK_API_KEY`: DeepSeek API密钥

其他可选配置项请参考 `.env.example` 文件。

# 运行
pnpm start
```

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解更多信息。

## 作者

Wenxin - [@wenxin1114](https://github.com/wenxin1114)
