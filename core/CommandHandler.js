import { Structs } from "node-napcat-ts";
import { generateImage } from "../api/dailyNews.js";
import { generateHistoryImage } from "../api/chatHistory.js";
import { douyinParse } from "../api/douyinParse.js";
import { log, error } from '../utils/logger.js';
import { getHotSearch, generateHotSearchImage } from '../api/hotSearch.js';
import { generateMenuImage } from '../api/menuImage.js';
import { createCommands } from './commands/index.js';
import { AppError, errorTypes } from '../utils/AppError.js';

export class CommandHandler {
  constructor(napcat, modelManager, config) {
    this.napcat = napcat;
    this.modelManager = modelManager;
    this.config = config;
    
    // 初始化命令处理器
    this.commands = createCommands(napcat, modelManager, config);

    // 等待模型管理器初始化
    this.initialized = this.modelManager.waitForInit().catch(err => {
        error('COMMAND', '模型管理器初始化失败', { error: err.message });
    });
  }

  async handleCommand(command, args, context) {
    // 确保初始化完成
    await this.initialized;

    // 如果不是以 / 开头，直接作为普通消息处理
    if (!command.startsWith('/')) {
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

    try {
      // 查找匹配的命令
      const handler = this.commands.find(cmd => cmd.matches(command));
      if (!handler) {
        return false;
      }

      await handler.execute(args, context);
      return true;
    } catch (err) {
      // 如果已经是 AppError 就直接抛出
      if (err instanceof AppError) {
        throw err;
      }

      // 否则包装成 AppError
      throw new AppError(
        errorTypes.COMMAND_ERROR,
        err.message || '命令执行失败',
        {
          command,
          args,
          userId: context.user_id,
          groupId: context.group_id,
          originalError: err.message
        }
      );
    }
  }
}
