import { BaseCommand } from './BaseCommand.js';
import { ImageService } from '../../services/imageService.js';

export class MenuCommand extends BaseCommand {
    constructor(napcat, config) {
        super('/菜单', '显示命令菜单');
        this.setNapcat(napcat);
        this.config = config;
    }

    async execute(args, context) {
        try {
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
                            font-size: 15px;
                            font-weight: 600;
                            margin-bottom: 12px;
                        }
                        .section {
                            margin-bottom: 12px;
                        }
                        .section:last-child {
                            margin-bottom: 0;
                        }
                        .section-title {
                            color: #202124;
                            font-weight: 600;
                            font-size: 13px;
                            margin-bottom: 8px;
                            padding-bottom: 4px;
                            border-bottom: 2px solid #e8f0fe;
                        }
                        .command-list {
                            display: grid;
                            gap: 4px;
                        }
                        .command-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 6px 8px;
                            background: #f8f9fa;
                            border-radius: 4px;
                            transition: background-color 0.2s;
                        }
                        .command-item:hover {
                            background: #e8f0fe;
                        }
                        .command-name {
                            color: #1a73e8;
                            font-family: monospace;
                            font-size: 12px;
                            font-weight: 500;
                            white-space: nowrap;
                            min-width: 70px;
                        }
                        .command-desc {
                            color: #5f6368;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="title">${this.config.bot.name} 功能菜单</div>
                        
                        <div class="section">
                            <div class="section-title">AI 对话</div>
                            <div class="command-list">
                                <div class="command-item">
                                    <div class="command-name">/问</div>
                                    <div class="command-desc">向当前模型提问</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/模型</div>
                                    <div class="command-desc">查看当前模型状态</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/切换</div>
                                    <div class="command-desc">快速切换AI模型</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/图问</div>
                                    <div class="command-desc">以图片方式显示AI回答</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/清除</div>
                                    <div class="command-desc">清除对话历史</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/历史</div>
                                    <div class="command-desc">查看聊天记录</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/提示词</div>
                                    <div class="command-desc">设置模型系统提示词</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">资讯功能</div>
                            <div class="command-list">
                                <div class="command-item">
                                    <div class="command-name">/知乎热搜</div>
                                    <div class="command-desc">获取知乎热搜榜</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/微博热搜</div>
                                    <div class="command-desc">获取微博热搜榜</div>
                                </div>
                                <div class="command-item">
                                    <div class="command-name">/今日新闻</div>
                                    <div class="command-desc">获取每日新闻</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">工具功能</div>
                            <div class="command-list">
                                <div class="command-item">
                                    <div class="command-name">/抖音解析</div>
                                    <div class="command-desc">解析抖音视频</div>
                                </div>
                            </div>
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
            throw new Error(`生成菜单失败：${err.message}`);
        }
    }
} 