import { NCWebsocket } from "node-napcat-ts";
import { config } from "./config.js";
import { ModelManager } from "./core/ModelManager.js";
import { CommandHandler } from "./core/CommandHandler.js";
import { TaskManager } from "./core/TaskManager.js";

const napcat = new NCWebsocket(
    config.napcat,
    false
);

const modelManager = new ModelManager(config);
const commandHandler = new CommandHandler(napcat, modelManager, config);
const taskManager = new TaskManager(napcat, config);

// 错误处理
napcat.on("error", (error) => {
    console.error("NapCat 错误:", error);
});

napcat.on("close", () => {
    console.log("NapCat 连接已关闭");
});

napcat.on("message.group", async (context) => {
    try {
        const { message: msg_list } = context;
        for (const message of msg_list) {
            if (message.type === "text") {
                const text = message.data.text.trim();
                const [command, ...args] = text.split(' ');
                await commandHandler.handleCommand(command, args, context);
            }
        }
    } catch (error) {
        console.error("处理群消息错误:", error);
    }
});


napcat.connect().then(() => {
    console.log("NapCat 连接成功");
    // 启动定时任务
    taskManager.startAllTasks();
}).catch(error => {
    console.error("NapCat 连接错误:", error);
});

// 优雅退出时停止定时任务
process.on('SIGINT', async () => {
    console.log('\n正在关闭机器人...');
    taskManager.stopAllTasks();
    await napcat.disconnect();
    process.exit(0);
});
