import { BaseCommand } from './BaseCommand.js';
import { getDailyNews } from '../../api/dailyNews.js';
import { ImageService } from '../../services/imageService.js';

export class NewsCommand extends BaseCommand {
    constructor(napcat) {
        super('/今日新闻', '获取每日新闻');
        this.napcat = napcat;
    }

    async execute(args, context) {
        try {
            // 先获取新闻数据
            const data = await getDailyNews();
            if (!data) {
                throw new Error('获取新闻数据失败');
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
                            color: #1a73e8;
                            margin-bottom: 12px;
                            font-size: 15px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        }
                        .title::before {
                            content: "📰";
                            font-size: 16px;
                        }
                        .news-list {
                            display: grid;
                            gap: 4px;
                        }
                        .news-item {
                            display: flex;
                            align-items: flex-start;
                            gap: 8px;
                            padding: 8px;
                            background: #f8f9fa;
                            border-radius: 4px;
                        }
                        .index {
                            color: #1a73e8;
                            font-size: 12px;
                            font-weight: 500;
                            min-width: 16px;
                            text-align: center;
                            padding-top: 2px;
                        }
                        .content {
                            flex: 1;
                            font-size: 13px;
                            color: #202124;
                            line-height: 1.4;
                        }
                        .date {
                            text-align: center;
                            color: #5f6368;
                            font-size: 12px;
                            margin-bottom: 8px;
                        }
                        .section {
                            margin-bottom: 12px;
                        }
                        .section:last-child {
                            margin-bottom: 0;
                        }
                        .section-title {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            color: #1a73e8;
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 8px;
                            padding-bottom: 4px;
                            border-bottom: 2px solid #e8f0fe;
                        }
                        .section-title::before {
                            content: "📅";
                            font-size: 16px;
                        }
                        .section-title.news::before {
                            content: "📰";
                        }
                        .history-list {
                            display: grid;
                            gap: 6px;
                        }
                        .history-item {
                            position: relative;
                            padding: 8px 12px 8px 28px;
                            background: #f8f9fa;
                            border-radius: 6px;
                            font-size: 13px;
                            color: #202124;
                            line-height: 1.5;
                        }
                        .history-item::before {
                            content: "•";
                            position: absolute;
                            left: 12px;
                            color: #1a73e8;
                            font-size: 16px;
                            font-weight: bold;
                        }
                        .history-year {
                            color: #1a73e8;
                            font-weight: 500;
                            margin-right: 6px;
                        }
                        .category-tag {
                            display: inline-block;
                            padding: 2px 6px;
                            background: #e8f0fe;
                            color: #1a73e8;
                            border-radius: 3px;
                            font-size: 11px;
                            margin-right: 6px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="title">今日新闻</div>
                        <div class="date">
                            ${data.calendar.yearCn} ${data.calendar.monthCn}${data.calendar.dayCn} · ${data.calendar.cMonth}月${data.calendar.cDay}日 · ${data.calendar.ncWeek}
                            ${data.calendar.term ? ` · ${data.calendar.term}` : ''}
                        </div>
                        
                        <div class="section">
                            <div class="section-title">历史上的今天</div>
                            <div class="history-list">
                                ${data.history.map(item => {
                                    const match = item.match(/^(\d{4})年/);
                                    const year = match ? match[1] : '';
                                    const content = match ? item.replace(/^\d{4}年/, '').trim() : item;
                                    return `
                                        <div class="history-item">
                                            ${year ? `<span class="history-year">${year}年</span>` : ''}
                                            ${content}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title news">热点新闻</div>
                            <div class="news-list">
                                ${data.news.map((item, index) => `
                                    <div class="news-item">
                                        <div class="index">${index + 1}</div>
                                        <div class="content">
                                            <span class="category-tag">${item.category}</span>
                                            ${item.title}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
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
            throw new Error(`获取新闻失败：${err.message}`);
        }
    }
} 