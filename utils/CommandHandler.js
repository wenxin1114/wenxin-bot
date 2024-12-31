export class CommandHandler {
    constructor(napcat, modelManager) {
        this.napcat = napcat;
        this.modelManager = modelManager;
        this.commands = {
            '/菜单': this.handleMenuCommand.bind(this),
            '/模型': this.handleModelCommand.bind(this),
            '/问': this.handleChatCommand.bind(this)
        };
    }

    async handleCommand(command, args, group_id) {
        const handler = this.commands[command];
        if (handler) {
            await handler(args, group_id);
            return true;
        }
        return false;
    }

    async handleModelCommand(args, group_id) {
        if (args.length > 0) {
            try {
                const modelName = args[0].trim();
                this.modelManager.setModel(modelName);
                
                // 如果有额外的参数，作为系统提示
                if (args.length > 1) {
                    const prompt = args.slice(1).join(' ');
                    this.modelManager.setSystemPrompt(prompt);
                }
                
                const currentPrompt = this.modelManager.getSystemPrompt();
                await this.sendGroupMessage(group_id, 
                    `已切换到${modelName}模型\n当前系统提示：${currentPrompt}`
                );
            } catch (error) {
                await this.sendGroupMessage(group_id, `错误：${error.message}`);
            }
        } else {
            let content = "===== 模型 =====\n";
            const currentModel = this.modelManager.getCurrentModel();
            this.modelManager.getAvailableModels().forEach(model => {
                content += `${model === currentModel ? '*' : ' '}${model}\n`;
            });
            content += "\n系统提示：" + this.modelManager.getSystemPrompt();
            content += "\n\n使用方法：\n/模型 模型名 [系统提示]";
            await this.sendGroupMessage(group_id, content);
        }
    }

    async handleChatCommand(args, group_id) {
        try {
            const message = args.join(' ');
            const response = await this.modelManager.chat(message);
            if (response) {
                await this.sendGroupMessage(group_id, response);
            }
        } catch (error) {
            await this.sendGroupMessage(group_id, `错误：${error.message}`);
        }
    }

    async handleMenuCommand(args, group_id) {
        let content = "===== 命令菜单 =====\n";
        content += "/菜单 - 显示此菜单\n";
        content += "/模型 模型名 [系统提示] - 查看/切换模型\n";
        content += "/问 问题 - 向当前模型提问\n\n";
        
        content += "===== 当前配置 =====\n";
        content += `当前模型：${this.modelManager.getCurrentModel()}\n`;
        content += `系统提示：${this.modelManager.getSystemPrompt()}\n\n`;
        
        content += "===== 可用模型 =====\n";
        const currentModel = this.modelManager.getCurrentModel();
        this.modelManager.getAvailableModels().forEach(model => {
            content += `${model === currentModel ? '*' : ' '}${model}\n`;
        });

        await this.sendGroupMessage(group_id, content);
    }

    async sendGroupMessage(group_id, content) {
        await this.napcat.send_group_msg({
            group_id,
            message: [{ type: 'text', data: { text: content } }]
        });
    }
} 