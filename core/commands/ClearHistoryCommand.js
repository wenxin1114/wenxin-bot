import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';

export class ClearHistoryCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/清除', '清除对话历史记录');
        this.napcat = napcat;
        this.modelManager = modelManager;
    }

    async execute(args, context) {
        try {
            this.modelManager.clearHistory(context.user_id, context.group_id);
            
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
                            width: 200px;
                            padding: 6px;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100%;
                        }
                        .card {
                            background: white;
                            padding: 10px;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            width: 100%;
                        }
                        .success {
                            color: #28a745;
                            font-size: 14px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        }
                        .success::before {
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
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="success">已清除对话历史</div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent, { compact: true });
            await this.napcat.send_group_msg({
                group_id: context.group_id,
                message: [{
                    type: 'image',
                    data: {
                        file: "base64://" + image,
                        subType: "0"
                    }
                }]
            });
        } catch (err) {
            throw new Error(`清除历史失败：${err.message}`);
        }
    }
} 