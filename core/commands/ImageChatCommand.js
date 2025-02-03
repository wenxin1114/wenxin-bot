import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';
import { marked } from 'marked';

export class ImageChatCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/图问', '以图片方式显示AI回答');
        this.setNapcat(napcat);
        this.modelManager = modelManager;
    }

    matches(command) {
        return command === '/图问' || command === '/图文';  // 添加 /图文 命令匹配
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

            // 将markdown转换为HTML
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        html {
                            background-color: #f5f6f7;
                            min-height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        body {
                            width: 380px;
                            padding: 6px;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100%;
                        }
                        .card {
                            background: white;
                            padding: 12px;
                            border-radius: 10px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            width: 100%;
                        }
                        .question {
                            color: #1a73e8;
                            font-size: 14px;
                            font-weight: 500;
                            margin-bottom: 8px;
                            padding-bottom: 8px;
                            border-bottom: 2px solid #e8f0fe;
                        }
                        .answer {
                            color: #202124;
                            font-size: 13px;
                            line-height: 1.6;
                        }
                        .answer pre {
                            background: #f8f9fa;
                            padding: 8px;
                            border-radius: 4px;
                            overflow-x: auto;
                            margin: 8px 0;
                        }
                        .answer code {
                            font-family: monospace;
                            background: #f8f9fa;
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                        .answer p {
                            margin: 8px 0;
                        }
                        .answer ul, .answer ol {
                            margin: 8px 0;
                            padding-left: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="question">${question}</div>
                        <div class="answer">${marked(response)}</div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent);
            await this.sendReply(context, null, { 
                image: "base64://" + image
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            throw new Error(`AI回答失败：${errorMessage}`);
        }
    }
}