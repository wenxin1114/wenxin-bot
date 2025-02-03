import { BaseCommand } from './BaseCommand.js';
import { getHotSearch } from '../../api/hotSearch.js';
import { ImageService } from '../../services/imageService.js';

export class HotSearchCommand extends BaseCommand {
    constructor(napcat) {
        super('/热搜', '查看热搜榜单');
        this.setNapcat(napcat);
    }

    matches(command) {
        return command === '/知乎热搜' || command === '/微博热搜';
    }

    async execute(args, context) {
        try {
            const platform = context.raw_message.includes('知乎') ? 'zhihu' : 'weibo';
            const platformName = platform === 'zhihu' ? '知乎' : '微博';
            
            const data = await getHotSearch(platform);
            if (!data?.items?.length) {
                throw new Error(`获取${platformName}热搜失败`);
            }

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
                            color: #333;
                            margin-bottom: 12px;
                            font-size: 15px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        }
                        .title::before {
                            content: "${platform === 'zhihu' ? '知' : '微'}";
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 20px;
                            height: 20px;
                            background: ${platform === 'zhihu' ? '#0066ff' : '#ff8200'};
                            color: white;
                            border-radius: 4px;
                            font-size: 12px;
                        }
                        .hot-list {
                            display: grid;
                            gap: 4px;
                        }
                        .hot-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 8px;
                            background: #f8f9fa;
                            border-radius: 4px;
                        }
                        .rank {
                            width: 20px;
                            height: 20px;
                            line-height: 20px;
                            text-align: center;
                            background: #eee;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 600;
                            color: #666;
                            flex-shrink: 0;
                        }
                        .rank-1, .rank-2, .rank-3 {
                            color: white;
                        }
                        .rank-1 { background: #f44336; }
                        .rank-2 { background: #ff9800; }
                        .rank-3 { background: #ffc107; }
                        .content {
                            flex: 1;
                            font-size: 13px;
                            color: #202124;
                            line-height: 1.4;
                        }
                        .hot {
                            font-size: 11px;
                            color: #5f6368;
                            white-space: nowrap;
                            flex-shrink: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="title">${platformName}热搜榜</div>
                        <div class="hot-list">
                            ${data.items.slice(0, 20).map((item, index) => `
                                <div class="hot-item">
                                    <div class="rank rank-${index + 1}">${index + 1}</div>
                                    <div class="content">${item.title}</div>
                                    <div class="hot">${item.hot || ''}</div>
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
            throw new Error(`获取${platformName}热搜失败：${err.message}`);
        }
    }
} 