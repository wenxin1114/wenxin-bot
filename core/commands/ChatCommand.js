import { BaseCommand } from './BaseCommand.js';

export class ChatCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/问', '向当前模型提问');
        this.setNapcat(napcat);
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

            await this.sendReply(context, response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            throw new Error(`AI回答失败：${errorMessage}`);
        }
    }
} 