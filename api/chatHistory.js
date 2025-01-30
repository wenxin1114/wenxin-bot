import puppeteer from 'puppeteer';

export async function generateHistoryImage(history, username, modelName) {
    try {
        // 生成 HTML 内容
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>聊天记录</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background-color: #f9f9f9;
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
                    .chat-container {
                        margin-top: 20px;
                    }
                    .message {
                        margin-bottom: 15px;
                        display: flex;
                        flex-direction: column;
                    }
                    .message .meta {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .message .content {
                        padding: 10px;
                        border-radius: 8px;
                        max-width: 80%;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                    .user-message {
                        align-items: flex-end;
                    }
                    .user-message .content {
                        background-color: #007AFF;
                        color: white;
                    }
                    .assistant-message {
                        align-items: flex-start;
                    }
                    .assistant-message .content {
                        background-color: #E9ECEF;
                        color: black;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>聊天记录</h1>
                        <p>用户：${username} | 模型：${modelName}</p>
                    </div>
                    <div class="chat-container">
                        ${history.map(msg => `
                            <div class="message ${msg.role}-message">
                                <div class="meta">${msg.role === 'user' ? '用户' : 'AI助手'}</div>
                                <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
                            </div>
                        `).join('')}
                    </div>
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
            width: 1000,
            height: 800
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
            width: 1000,
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
        console.error('生成聊天记录图片时出错：', error);
        return null;
    }
} 