import { BaseCommand } from './BaseCommand.js';
import { generateHistoryImage } from '../../api/chatHistory.js';
import { ImageService } from '../../services/imageService.js';

export class HistoryCommand extends BaseCommand {
    constructor(napcat, modelManager) {
        super('/历史', '查看聊天记录');
        this.setNapcat(napcat);
        this.modelManager = modelManager;
    }

    async execute(args, context) {
        try {
            const history = this.modelManager.chatHistory.getFormattedHistory(
                context.user_id,
                context.group_id
            );

            if (!history || history.length === 0) {
                await this.sendReply(context, "暂无聊天记录");
                return;
            }

            const username = context.sender?.card || context.sender?.nickname || '用户';
            const modelName = this.modelManager.getCurrentModel();

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
                            text-align: center;
                            color: #1a73e8;
                            margin-bottom: 10px;
                            font-size: 15px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        }
                        .title::before {
                            content: "💬";
                            font-size: 16px;
                        }
                        .user-info {
                            text-align: center;
                            color: #5f6368;
                            font-size: 12px;
                            margin-bottom: 10px;
                            padding-bottom: 6px;
                            border-bottom: 2px solid #e8f0fe;
                        }
                        .chat-list {
                            display: grid;
                            gap: 10px;
                        }
                        .chat-item {
                            display: grid;
                            gap: 3px;
                        }
                        .message-meta {
                            font-size: 11px;
                            color: #5f6368;
                        }
                        .message-content {
                            position: relative;
                            padding: 8px 10px;
                            border-radius: 6px;
                            font-size: 13px;
                            line-height: 1.5;
                        }
                        .user .message-content {
                            background: #e8f0fe;
                            color: #1a73e8;
                            margin-right: 8px;
                        }
                        .assistant .message-content {
                            background: #f8f9fa;
                            color: #202124;
                            margin-left: 8px;
                        }
                        .user {
                            text-align: right;
                        }
                        .assistant {
                            text-align: left;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="title">聊天记录</div>
                        <div class="user-info">
                            用户：${username} | 模型：${modelName}
                        </div>
                        <div class="chat-list">
                            ${history.map(msg => `
                                <div class="chat-item ${msg.role}">
                                    <div class="message-meta">
                                        ${msg.role === 'user' ? '用户' : 'BOT'}
                                    </div>
                                    <div class="message-content">
                                        ${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            `).join('')}
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
            throw new Error(`获取历史记录失败：${err.message}`);
        }
    }
} 