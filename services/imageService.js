import puppeteer from 'puppeteer';

export class ImageService {
    static async generateImage(htmlContent, options = {}) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setContent(htmlContent);

            // 等待内容渲染完成
            await page.evaluate(() => document.fonts.ready);

            // 获取实际内容大小
            const bodyHandle = await page.$('body');
            const { width, height } = await bodyHandle.boundingBox();
            await bodyHandle.dispose();

            // 根据内容类型设置不同的边距
            const padding = options.compact ? 16 : 40;  // 紧凑型使用更小的边距
            const finalWidth = Math.ceil(width) + padding;
            const finalHeight = Math.ceil(height) + padding;

            // 设置视口大小
            await page.setViewport({
                width: finalWidth,
                height: finalHeight,
                deviceScaleFactor: 2
            });

            // 重新设置内容以确保正确渲染
            await page.setContent(htmlContent);
            await page.evaluate(() => document.fonts.ready);

            // 截图
            const imageBuffer = await page.screenshot({
                encoding: 'base64',
                type: 'jpeg',
                quality: 85,
                omitBackground: true
            });

            return imageBuffer;
        } finally {
            await browser.close();
        }
    }
} 