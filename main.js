import { NCWebsocket } from "node-napcat-ts";
import { config } from "./config.js";
import { CommandHandler } from "./core/CommandHandler.js";
import { ModelManager } from "./core/ModelManager.js";
import { TaskManager } from "./core/TaskManager.js";
import { log } from './utils/logger.js';

const napcat = new NCWebsocket(
    config.napcat,
    false
);
const modelManager = new ModelManager(config);
const commandHandler = new CommandHandler(napcat, modelManager, config);
const taskManager = new TaskManager(napcat, config);

// 错误处理
napcat.on("error", (error) => {
    log('ERROR', "NapCat 错误", { error });
});

napcat.on("close", () => {
    log('SYSTEM', "NapCat 连接已关闭");
});

// 用于消息去重的 Set
const processedMessages = new Set();

napcat.on("message.group", async (context) => {
    try {
        const { message: msg_list } = context;
        
        // 检查消息是否已处理
        const messageKey = `${context.group_id}-${context.message_id}`;
        if (processedMessages.has(messageKey)) {
            return;
        }
        processedMessages.add(messageKey);

        // 5分钟后清除消息记录
        setTimeout(() => {
            processedMessages.delete(messageKey);
        }, 5 * 60 * 1000);

        for (const message of msg_list) {
            if (message.type === "text") {
                const text = message.data.text.trim();
                const [command, ...args] = text.split(' ');
                await commandHandler.handleCommand(command, args, context);
            }
        }
    } catch (error) {
        log('ERROR', "处理群消息错误", { error });
    }
});

napcat.connect().then(() => {
    log('SYSTEM', "NapCat 连接成功");
    // 启动定时任务
    taskManager.startAllTasks();
}).catch(error => {
    log('ERROR', "NapCat 连接错误", { error });
});

// 优雅退出时停止定时任务
process.on('SIGINT', async () => {
    log('SYSTEM', '正在关闭机器人...');
    taskManager.stopAllTasks();
    await napcat.disconnect();
    process.exit(0);
});
