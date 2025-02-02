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
                        .title {
                            color: #1a73e8;
                            font-size: 15px;
                            font-weight: 600;
                            margin-bottom: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        }
                        .title::before {
                            content: "🤖";
                            font-size: 16px;
                        }
                        .model-info {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 8px;
                        }
                        .current-model {
                            background: #e8f0fe;
                            color: #1a73e8;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                        }
                        .available-models {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                            gap: 6px;
                        }
                        .model-item {
                            background: #f8f9fa;
                            color: #5f6368;
                            padding: 4px 10px;
                            border-radius: 4px;
                            font-size: 13px;
                        }
                        .prompt {
                            text-align: center;
                            color: #202124;
                            font-size: 13px;
                            line-height: 1.5;
                            margin-top: 8px;
                            padding-top: 8px;
                            border-top: 2px solid #e8f0fe;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="title">AI 模型设置</div>
                        <div class="model-info">
                            <div class="current-model">当前模型：${currentModel}</div>
                            <div class="available-models">
                                ${availableModels.map(model => `
                                    <div class="model-item">${model}</div>
                                `).join('')}
                            </div>
                            ${currentSystemPrompt ? `
                                <div class="prompt">
                                    系统提示词：${currentSystemPrompt}
                                </div>
                            ` : ''}
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