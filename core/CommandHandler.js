import { Structs } from "node-napcat-ts";
import { generateImage } from "../api/dailyNews.js";
import { generateHistoryImage } from "../api/chatHistory.js";
import { douyinParse } from "../api/douyinParse.js";
import { log, error } from '../utils/logger.js';
import { getHotSearch, generateHotSearchImage } from '../api/hotSearch.js';
import { generateMenuImage } from '../api/menuImage.js';

export class CommandHandler {
  constructor(napcat, modelManager, config) {
    this.napcat = napcat;
    this.modelManager = modelManager;
    this.config = config;
    
    // 命令处理器映射 - 使用 Map 确保唯一匹配
    this.commands = new Map([
      ['/菜单', this.handleMenuCommand.bind(this)],
      ['/模型', this.handleModelCommand.bind(this)],
      ['/问', this.handleChatCommand.bind(this)],
      ['/清除', this.handleClearHistoryCommand.bind(this)],
      ['/历史', this.handleHistoryCommand.bind(this)],
      ['/抖音解析', this.handleDouyinCommand.bind(this)],
      ['/关机', this.handleShutdown.bind(this)],
      ['/开机', this.handleBootUp.bind(this)],
      ['/今日新闻', this.handleNewsCommand.bind(this)]
    ]);

    // 正则命令单独处理
    this.regexCommands = [
      {
        match: /^\/(知乎|微博)热搜$/,
        handler: this.handleHotSearchCommand.bind(this)
      }
    ];
  }

  async handleCommand(command, args, context) {
    // 如果不是以 / 开头，直接作为普通消息处理
    if (!command.startsWith('/')) {
      log('MESSAGE', '收到群消息', {
        group_id: context.group_id,
        user_id: context.user_id,
        sender: context.sender?.card || context.sender?.nickname,
        content: command
      });
      return false;
    }

    log('COMMAND', '执行命令', {
      command,
      args,
      context: {
        group_id: context.group_id,
        user_id: context.user_id,
        message_id: context.message_id,
        sender: context.sender?.card || context.sender?.nickname
      }
    });

    // 机器人状态检查
    const { user_id } = context;
    if (!this.config.bot.state && user_id != this.config.bot.master) {
      log('COMMAND', '机器人已关机，仅管理员可用');
      return false;
    }

    try {
      // 先检查精确匹配命令
      const handler = this.commands.get(command);
      if (handler) {
        await handler(args, context);
        return true;
      }

      // 再检查正则匹配命令
      const regexCommand = this.regexCommands.find(cmd => cmd.match.test(command));
      if (regexCommand) {
        await regexCommand.handler(args, context);
        return true;
      }

      return false;
    } catch (err) {
      error('COMMAND', '命令执行失败', {
        error: err.message,
        stack: err.stack
      });
      return false;
    }
  }

  async handleShutdown(args, context) {
    const { user_id } = context;
    if (user_id == this.config.bot.master) {
      log("shutdown")
      this.config.bot.state = false;
      await this.sendGroupMessage(context, "已关机");
    }
  }

  async handleBootUp(args, context) {
    const { user_id } = context;
    if (user_id == this.config.bot.master) {
      this.config.bot.state = true;
      await this.sendGroupMessage(context, "已开机");
    }
  }

  async handleModelCommand(args, context) {
    if (args.length > 0) {
      try {
        const modelName = args[0].trim();
        this.modelManager.setModel(modelName);

        if (args.length > 1) {
          const prompt = args.slice(1).join(" ");
          this.modelManager.setSystemPrompt(prompt);
        }

        const currentPrompt = this.modelManager.getSystemPrompt();
        await this.sendGroupMessage(
          context,
          `已切换到${modelName}模型\n当前系统提示：${currentPrompt}`
        );
      } catch (error) {
        await this.sendGroupMessage(context, `错误：${error.message}`);
      }
    } else {
      let content = "===== 模型 =====\n";
      const currentModel = this.modelManager.getCurrentModel();
      this.modelManager.getAvailableModels().forEach((model) => {
        content += `${model === currentModel ? "*" : " "}${model}\n`;
      });
      content += "\n系统提示：" + this.modelManager.getSystemPrompt();
      content += "\n\n使用方法：\n/模型 模型名 [系统提示]";
      await this.sendGroupMessage(context, content);
    }
  }

  async handleChatCommand(args, context) {
    const { group_id, user_id } = context;
    try {
      const message = args.join(" ");
      log('CHAT', '收到消息', {
        user_id,
        group_id,
        message
      });

      const response = await this.modelManager.chat(message, user_id, group_id);
      log('CHAT', 'AI响应', { response });

      if (response) {
        await this.sendGroupMessage(context, response);
      }
    } catch (err) {
      error('CHAT', '聊天命令处理失败', {
        error: err.message,
        stack: err.stack
      });
      await this.sendGroupMessage(context, `错误：${err.message}`);
    }
  }

  async handleClearHistoryCommand(args, context) {
    const { group_id, user_id } = context;
    this.modelManager.clearHistory(user_id, group_id);
    await this.sendGroupMessage(context, "已清除您的对话历史记录");
  }

  async handleHistoryCommand(args, context) {
    const { group_id, user_id, sender } = context;
    const history = this.modelManager.chatHistory.getFormattedHistory(user_id, group_id);
    
    if (!history || history.length === 0) {
      await this.sendGroupMessage(context, "暂无聊天记录");
      return;
    }

    const username = sender.card || sender.nickname;
    const modelName = this.modelManager.getCurrentModel();
    
    try {
      const image = await generateHistoryImage(history, username, modelName);
      if (image) {
        await this.sendGroupMessage(context, null, ["base64://" + image, "chatHistory.png"]);
      } else {
        await this.sendGroupMessage(context, "生成聊天记录失败");
      }
    } catch (error) {
      await this.sendGroupMessage(context, `错误：${error.message}`);
    }
  }

  async handleDouyinCommand(args, context) {
    const { group_id } = context;
    if (!args.length) {
      await this.sendGroupMessage(context, "请提供抖音链接");
      return;
    }

    try {
      const url = args[0];
      const videoUrl = await douyinParse(url);


      await this.napcat.send_group_msg({
        group_id,
        message: [Structs.video(videoUrl)]
      });
    } catch (error) {
      await this.sendGroupMessage(context, `解析失败：${error.message}`);
    }
  }

  async handleMenuCommand(args, context) {
    try {
        const image = await generateMenuImage(this.config);
        if (image) {
            await this.sendGroupMessage(context, null, ["base64://" + image, "menu.png"]);
        } else {
            // 作为后备，如果图片生成失败则发送文本
            let content = "===== 菜单 =====\n";
            content += "机器人状态: " + (this.config.bot.state ? "开机" : "关机") + "\n";
            content += "/菜单 - 显示此菜单\n";
            content += "/模型 模型名 [系统提示] - 查看/切换模型\n";
            content += "/问 问题 - 向当前模型提问\n";
            content += "/清除 - 清除对话历史记录\n";
            content += "/历史 - 查看聊天记录\n";
            content += "/抖音解析 链接 - 解析抖音视频\n";
            content += "/知乎热搜 - 获取知乎热搜榜\n";
            content += "/微博热搜 - 获取微博热搜榜\n";
            content += "/今日新闻 - 获取今日新闻";
            await this.sendGroupMessage(context, content);
        }
    } catch (err) {
        error('MENU', '生成菜单失败', {
            error: err.message,
            stack: err.stack
        });
        await this.sendGroupMessage(context, "生成菜单失败：" + err.message);
    }
  }

  async handleNewsCommand(args, context) {
    const image = await generateImage();
    if (image) {
      await this.sendGroupMessage(context, null, ["base64://" + image, "dailyNews.png"]);
    } else {
      await this.sendGroupMessage(context, "获取失败");
    }
  }

  async handleHotSearchCommand(args, context) {
    const command = context.raw_message;
    const platform = command.includes('知乎') ? 'zhihu' : 'weibo';
    const platformName = platform === 'zhihu' ? '知乎' : '微博';
    
    try {
        log('HOTSEARCH', `获取${platformName}热搜`);
        const data = await getHotSearch(platform);
        
        if (data && data.items) {
            const image = await generateHotSearchImage(data, platformName);
            if (image) {
                await this.sendGroupMessage(context, null, ["base64://" + image, "hotSearch.png"]);
            } else {
                await this.sendGroupMessage(context, "生成热搜图片失败");
            }
        } else {
            await this.sendGroupMessage(context, "获取热搜数据失败");
        }
    } catch (err) {
        error('HOTSEARCH', '获取热搜失败', {
            platform,
            error: err.message
        });
        await this.sendGroupMessage(context, `获取${platformName}热搜失败：${err.message}`);
    }
  }

  async sendGroupMessage(context, content = null, image = null) {
    const group_id = context.group_id || context;
    const message = [];

    // 构建消息
    if (typeof context === 'object' && context.message_id) {
        message.push(Structs.reply(context.message_id));
    }

    if (content) {
        message.push(Structs.text(content));
    }
    if (image) {
        message.push(Structs.image(image[0], image[1]));
    }

    try {
        // 只记录一次发送消息的日志
        log('MESSAGE', '发送消息', {
            group_id,
            content,
            hasImage: !!image,
            hasReply: !!(typeof context === 'object' && context.message_id)
        });

        await this.napcat.send_group_msg({
            group_id,
            message,
            auto_escape: false,
        });
    } catch (err) {
        error('MESSAGE', '消息发送失败', {
            error: err.message,
            stack: err.stack
        });
        throw err;
    }
  }
}
