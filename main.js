import { NCWebsocket } from "node-napcat-ts";
import { config } from "./config.js";
import { ModelManager } from "./utils/ModelManager.js";
import { CommandHandler } from "./utils/CommandHandler.js";

const napcat = new NCWebsocket(
    {
        protocol: "ws",
        host: "127.0.0.1",
        port: 3001,
        accessToken: "yiajh9khafj",
        throwPromise: true,
        reconnection: {
            enable: true,
            attempts: 10,
            delay: 5000,
        },
    },
    false
);

const modelManager = new ModelManager(config);
const commandHandler = new CommandHandler(napcat, modelManager);

napcat.on("message.group", async (context) => {
    const { group_id, message: msg_list } = context;
    for (const message of msg_list) {
        if (message.type === "text") {
            const text = message.data.text.trim();
            const [command, ...args] = text.split(' ');
            
            await commandHandler.handleCommand(command, args, group_id);
        }
    }
});

napcat.connect();
