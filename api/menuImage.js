import puppeteer from 'puppeteer';

export async function generateMenuImage(config) {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>菜单</title>
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
                    .status {
                        color: #666;
                        margin: 10px 0;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 5px;
                    }
                    .commands {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .command-item {
                        padding: 12px 15px;
                        border-bottom: 1px solid #eee;
                    }
                    .command-item:last-child {
                        border-bottom: none;
                    }
                    .command {
                        font-weight: bold;
                        color: #1a73e8;
                    }
                    .description {
                        color: #666;
                        margin-top: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NapCat 菜单</h1>
                        <div class="status">
                            机器人状态: ${config.bot.state ? '开机' : '关机'}
                        </div>
                    </div>
                    <ul class="commands">
                        <li class="command-item">
                            <div class="command">/菜单</div>
                            <div class="description">显示此菜单</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/模型 模型名 [系统提示]</div>
                            <div class="description">查看/切换AI模型</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/问 问题</div>
                            <div class="description">向当前模型提问</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/清除</div>
                            <div class="description">清除对话历史记录</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/历史</div>
                            <div class="description">查看聊天记录</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/抖音解析 链接</div>
                            <div class="description">解析抖音视频</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/知乎热搜</div>
                            <div class="description">获取知乎热搜榜</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/微博热搜</div>
                            <div class="description">获取微博热搜榜</div>
                        </li>
                        <li class="command-item">
                            <div class="command">/今日新闻</div>
                            <div class="description">获取今日新闻</div>
                        </li>
                    </ul>
                </div>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            args: ['--disable-web-security', '--no-sandbox'],
            headless: 'new'
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 900,
            height: 800
        });

        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
        });

        const bodyHandle = await page.$('body');
        const { height } = await bodyHandle.boundingBox();
        await bodyHandle.dispose();

        await page.setViewport({
            width: 900,
            height: Math.ceil(height)
        });

        const base64Image = await page.screenshot({
            fullPage: true,
            type: 'png',
            encoding: 'base64'
        });

        await browser.close();
        return base64Image;
    } catch (error) {
        console.error('生成菜单图片时出错：', error);
        return null;
    }
} 