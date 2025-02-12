import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';

export class SwitchModelCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/切换', '切换AI模型');
        this.setNapcat(napcat);
        this.modelManager = modelManager;
    }

    async execute(args, context) {
        const modelName = args[0];
        if (!modelName) {
            throw new Error('请指定要切换的模型名称');
        }

        try {
            this.modelManager.setModel(context.user_id, context.group_id, modelName);
            
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
                        }
                        .model-name {
                            font-weight: 500;
                            margin-left: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="status">切换成功</div>
                        <div class="model">
                            当前模型：<span class="model-name">${modelName}</span>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent);
            await this.sendReply(context, null, { 
                image: "base64://" + image
            });
        } catch (err) {
            throw new Error(`切换模型失败：${err.message}`);
        }
    }
} 