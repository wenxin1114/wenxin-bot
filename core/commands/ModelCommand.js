import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';

export class ModelCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/模型', '查看/切换AI模型');
        this.napcat = napcat;
        this.modelManager = modelManager;
    }

    matches(command) {
        return command === '/模型';
    }

    async execute(args, context) {
        const modelName = args[0];
        const newSystemPrompt = args.slice(1).join(' ');

        if (!modelName) {
            // 显示当前模型状态
            const currentModel = this.modelManager.getCurrentModel();
            const availableModels = this.modelManager.getAvailableModels();
            const currentSystemPrompt = this.modelManager.getSystemPrompt();

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        html {
                            margin: 0;
                            padding: 0;
                            background-color: #f5f6f7;
                        }
                        body {
                            margin: 0;
                            padding: 5px;
                            font-family: Arial, sans-serif;
                            width: 500px;  /* 保持宽一点，因为内容较多 */
                            margin: 0 auto;
                            box-sizing: border-box;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .container {
                            background: white;
                            padding: 10px;
                            border-radius: 12px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            width: 100%;
                        }
                        .title {
                            text-align: center;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .model-list {
                            margin-bottom: 20px;
                        }
                        .model-item {
                            padding: 10px;
                            border-bottom: 1px solid #eee;
                        }
                        .current {
                            color: #1a73e8;
                            font-weight: bold;
                        }
                        .prompt {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 5px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 class="title">模型状态</h2>
                        <div class="model-list">
                            ${availableModels.map(model => `
                                <div class="model-item ${model === currentModel ? 'current' : ''}">
                                    ${model === currentModel ? '* ' : '  '}${model}
                                </div>
                            `).join('')}
                        </div>
                        <div class="prompt">
                            <strong>系统提示：</strong><br>
                            ${currentSystemPrompt}
                        </div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent);
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
            return;
        }

        // 切换模型
        try {
            this.modelManager.setModel(modelName);
            if (newSystemPrompt) {
                this.modelManager.setSystemPrompt(newSystemPrompt);
            }

            // 生成切换成功的图片
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
                            width: 300px;
                            padding: 8px;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .card {
                            background: white;
                            padding: 16px;
                            border-radius: 12px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            text-align: center;
                            width: 100%;
                        }
                        .status {
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            margin-bottom: 8px;
                            color: #28a745;
                            font-size: 15px;
                            font-weight: 500;
                        }
                        .status::before {
                            content: "✓";
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 18px;
                            height: 18px;
                            background: #28a745;
                            color: white;
                            border-radius: 50%;
                            font-size: 12px;
                        }
                        .model {
                            color: #1a73e8;
                            font-size: 14px;
                            font-weight: 500;
                        }
                        .model-name {
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
            throw new Error(`切换模型失败：${err.message}`);
        }
    }
} 