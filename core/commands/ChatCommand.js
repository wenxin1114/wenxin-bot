import { BaseCommand } from './BaseCommand.js';

export class ChatCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/问', '向当前模型提问');
        this.napcat = napcat;
        this.modelManager = modelManager;
    }

    async execute(args, context) {
        const question = args.join(' ');
        if (!question) {
            throw new Error('请输入问题内容');
        }

        try {
            const response = await this.modelManager.chat(
                question,
                context.user_id,
                context.group_id
            );

            await this.napcat.send_group_msg({
                group_id: context.group_id,
                message: response
            });
        } catch (err) {
            throw new Error(`AI回答失败：${err.message}`);
        }
    }
} 