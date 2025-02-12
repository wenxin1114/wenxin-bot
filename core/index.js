import { NCWebsocket } from "node-napcat-ts";
import { Config } from "../config/index.js";
import { CommandHandler } from "./CommandHandler.js";
import { ModelManager } from "./ModelManager.js";
import { TaskManager } from "./TaskManager.js";
import { log, error as logError } from '../utils/logger.js';

export class Bot {
    constructor() {
        this.config = new Config();
        this.napcat = new NCWebsocket(this.config.napcat, false);
        this.modelManager = new ModelManager(this.config);
        this.commandHandler = new CommandHandler(this.napcat, this.modelManager, this.config);
        this.taskManager = new TaskManager(this.napcat, this.config);
        this.processedMessages = new Set();
    }

    async start() {
        try {
            this.setupEventHandlers();
            await this.napcat.connect();
            log('SYSTEM', "NapCat 连接成功");
            this.taskManager.startAllTasks();
        } catch (err) {
            logError('SYSTEM', "启动失败", { error: err });
            process.exit(1);
        }
    }

    setupEventHandlers() {
        this.napcat.on("error", this.handleError.bind(this));
        this.napcat.on("close", this.handleClose.bind(this));
        this.napcat.on("message.group", this.handleGroupMessage.bind(this));
        process.on('SIGINT', this.handleShutdown.bind(this));
    }

    handleError(error) {
        logError('ERROR', "NapCat 错误", { error });
    }

    handleClose() {
        log('SYSTEM', "NapCat 连接已关闭");
    }

    async handleGroupMessage(context) {
        try {
            const { message: msg_list } = context;
            
            // 检查消息是否已处理
            const messageKey = `${context.group_id}-${context.message_id}`;
            if (this.processedMessages.has(messageKey)) {
                return;
            }
            this.processedMessages.add(messageKey);

            // 5分钟后清除消息记录
            setTimeout(() => {
                this.processedMessages.delete(messageKey);
            }, 5 * 60 * 1000);

            for (const message of msg_list) {
                if (message.type === "text") {
                    const text = message.data.text.trim();
                    const [command, ...args] = text.split(' ');
                    await this.commandHandler.handleCommand(command, args, context);
                }
            }
        } catch (err) {
            logError('ERROR', "处理群消息错误", { error: err });
        }
    }

    async handleShutdown() {
        log('SYSTEM', '正在关闭机器人...');
        try {
            // 停止所有定时任务
            this.taskManager.stopAllTasks();
            // 使用统一的清理方法
            await this.cleanup();
        } catch (err) {
            logError('SYSTEM', '关闭失败', {
                error: err.message,
                stack: err.stack
            });
        }
        process.exit(0);
    }

    async cleanup() {
        try {
            log('BOT', '开始清理资源');
            
            // 清理模型管理器
            if (this.modelManager) {
                await this.modelManager.cleanup();
            }

            // 断开 napcat 连接
            if (this.napcat) {
                await this.napcat.disconnect();
            }

            log('BOT', '资源清理完成');
        } catch (err) {
            logError('BOT', '资源清理失败', {
                error: err.message,
                stack: err.stack
            });
            throw err;
        }
    }
}
