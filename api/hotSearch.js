import { ApiService } from '../services/apiService.js';
import { ImageService } from '../services/imageService.js';
import puppeteer from 'puppeteer';

export const getHotSearch = async (platform) => {
    return await ApiService.request({
        url: `https://newsnow.busiyi.world/api/s`,
        method: 'GET',
        params: { id: platform }
    });
};

export async function generateHotSearchImage(data, platform) {
    try {
        // 生成 HTML 内容
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${platform}热搜</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background-color: #f5f6f7;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #eee;
                    }
                    .header h1 {
                        color: #333;
                        margin: 0;
                        font-size: 24px;
                    }
                    .header p {
                        color: #666;
                        margin: 10px 0 0;
                    }
                    .hot-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .hot-item {
                        padding: 12px 15px;
                        border-bottom: 1px solid #eee;
                        display: flex;
                        align-items: center;
                    }
                    .hot-item:last-child {
                        border-bottom: none;
                    }
                    .hot-rank {
                        font-size: 16px;
                        font-weight: bold;
                        color: #ff4d4f;
                        margin-right: 15px;
                        min-width: 25px;
                    }
                    .hot-rank.top3 {
                        font-size: 18px;
                        color: #ff1f3d;
                    }
                    .hot-content {
                        flex: 1;
                    }
                    .hot-title {
                        font-size: 16px;
                        color: #333;
                        margin: 0;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${platform}热搜榜</h1>
                        <p>更新时间：${new Date(data.updatedTime).toLocaleString('zh-CN')}</p>
                    </div>
                    <ul class="hot-list">
                        ${data.items.slice(0, 20).map((item, index) => `
                            <li class="hot-item">
                                <span class="hot-rank ${index < 3 ? 'top3' : ''}">${index + 1}</span>
                                <div class="hot-content">
                                    <p class="hot-title">${item.title}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </body>
            </html>
        `;

        // 启动浏览器
        const browser = await puppeteer.launch({
            args: ['--disable-web-security', '--no-sandbox'],
            headless: 'new'
        });
        const page = await browser.newPage();

        // 设置视口大小
        await page.setViewport({
            width: 900,
            height: 1200
        });

        // 设置 HTML 内容
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
        });

        // 获取内容实际高度
        const bodyHandle = await page.$('body');
        const { height } = await bodyHandle.boundingBox();
        await bodyHandle.dispose();

        // 调整页面大小并截图
        await page.setViewport({
            width: 900,
            height: Math.ceil(height)
        });

        // 生成 base64 图片
        const base64Image = await page.screenshot({
            fullPage: true,
            type: 'png',
            encoding: 'base64'
        });

        // 关闭浏览器
        await browser.close();

        return base64Image;
    } catch (error) {
        console.error('生成热搜图片时出错：', error);
        return null;
    }
}