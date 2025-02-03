import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';

export class SetPromptCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/提示词', '设置模型系统提示词');
        this.setNapcat(napcat);
        this.modelManager = modelManager;
    }

    async execute(args, context) {
        const prompt = args.join(' ');
        if (!prompt) {
            throw new Error('请输入系统提示词');
        }

        try {
            this.modelManager.setSystemPrompt(prompt);
            const currentModel = this.modelManager.getCurrentModel();
            
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
                            width: 280px;
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
                            text-align: center;
                        }
                        .status {
                            color: #28a745;
                            font-size: 14px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            margin-bottom: 8px;
                        }
                        .status::before {
                            content: "✓";
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 16px;
                            height: 16px;
                            background: #28a745;
                            color: white;
                            border-radius: 50%;
                            font-size: 11px;
                        }
                        .model {
                            color: #1a73e8;
                            font-size: 14px;
                            margin-bottom: 8px;
                        }
                        .prompt {
                            color: #202124;
                            font-size: 13px;
                            line-height: 1.4;
                            padding-top: 8px;
                            border-top: 1px solid #e8f0fe;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="status">设置成功</div>
                        <div class="model">当前模型：${currentModel}</div>
                        <div class="prompt">${prompt}</div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent);
            await this.sendReply(context, null, { 
                image: "base64://" + image
            });
        } catch (err) {
            throw new Error(`设置系统提示词失败：${err.message}`);
        }
    }
} 