import { Structs } from "node-napcat-ts";
import { generateImage } from "../api/dailyNews.js";

export class CommandHandler {
  constructor(napcat, modelManager, config) {
    this.napcat = napcat;
    this.modelManager = modelManager;
    this.config = config;
    this.commands = {
      "/菜单": this.handleMenuCommand.bind(this),
      "/模型": this.handleModelCommand.bind(this),
      "/问": this.handleChatCommand.bind(this),
      "/关机": this.handleShutdown.bind(this),
      "/开机": this.handleBootUp.bind(this),
      "/今日新闻": this.handleNewsCommand.bind(this),
    };
  }

  
  async handleCommand(command, args, context) {
    const { user_id } = context;
    if (!this.config.bot.state && user_id != this.config.bot.master) {
      return false;
    }
    const handler = this.commands[command];
    if (handler) {
      await handler(args, context);
      return true;
    }
    return false;
  }

  async handleShutdown(args, context) {
    const { user_id, group_id } = context;
    if (user_id == this.config.bot.master) {
      console.log("shutdown")
      this.config.bot.state = false;
      await this.sendGroupMessage(group_id, "已关机");
    }
  }

  async handleBootUp(args, context) {
    const { user_id, group_id } = context;
    if (user_id == this.config.bot.master) {
      this.config.bot.state = true;
      await this.sendGroupMessage(group_id, "已开机");
    }
  }

  async handleModelCommand(args, context) {
    const { group_id } = context;
    if (args.length > 0) {
      try {
        const modelName = args[0].trim();
        this.modelManager.setModel(modelName);

        // 如果有额外的参数，作为系统提示
        if (args.length > 1) {
          const prompt = args.slice(1).join(" ");
          this.modelManager.setSystemPrompt(prompt);
        }

        const currentPrompt = this.modelManager.getSystemPrompt();
        await this.sendGroupMessage(
          group_id,
          `已切换到${modelName}模型\n当前系统提示：${currentPrompt}`
        );
      } catch (error) {
        await this.sendGroupMessage(group_id, `错误：${error.message}`);
      }
    } else {
      let content = "===== 模型 =====\n";
      const currentModel = this.modelManager.getCurrentModel();
      this.modelManager.getAvailableModels().forEach((model) => {
        content += `${model === currentModel ? "*" : " "}${model}\n`;
      });
      content += "\n系统提示：" + this.modelManager.getSystemPrompt();
      content += "\n\n使用方法：\n/模型 模型名 [系统提示]";
      await this.sendGroupMessage(group_id, content);
    }
  }

  async handleChatCommand(args, context) {
    const { group_id } = context;
    try {
      const message = args.join(" ");
      const response = await this.modelManager.chat(message);
      if (response) {
        await this.sendGroupMessage(group_id, response);
      }
    } catch (error) {
      await this.sendGroupMessage(group_id, `错误：${error.message}`);
    }
  }

  async handleMenuCommand(args, context) {
    const { group_id } = context;
    let content = "===== 菜单 =====\n";
    content += "机器人状态: " + (this.config.bot.state ? "开机" : "关机") + "\n";
    content += "/菜单 - 显示此菜单\n";
    content += "/模型 模型名 [系统提示] - 查看/切换模型\n";
    content += "/问 问题 - 向当前模型提问";
    await this.sendGroupMessage(group_id, content);
  }

  async handleNewsCommand(args, context) {
    const { group_id } = context;
    const image = await generateImage();
    if (image) {
      await this.sendGroupMessage(group_id, null, ["base64://" + image, "dailyNews.png"]);
    } else {
      await this.sendGroupMessage(group_id, "获取失败");
    }
  }

  async sendGroupMessage(group_id, content=null, image=null) {
    const message = []
    if (content) {
      message.push(Structs.text(content))
    }
    if (image) {
      message.push(Structs.image(image[0], image[1]))
    }
    await this.napcat.send_group_msg({
      group_id,
      message,
    });
  }
}
