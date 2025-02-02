import { BaseCommand } from './BaseCommand.js';
import { douyinParse } from '../../api/douyinParse.js';
import { ImageService } from '../../services/imageService.js';

export class DouyinCommand extends BaseCommand {
    constructor(napcat) {
        super('/抖音解析', '解析抖音视频');
        this.napcat = napcat;
    }

    async execute(args, context) {
        const url = args.join(' ');
        if (!url) {
            throw new Error('请输入抖音视频链接');
        }

        try {
            const videoUrl = await douyinParse(url);
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        html, body {
                            margin: 0;
                            padding: 0;
                            height: auto;
                        }
                        body {
                            font-family: Arial, sans-serif;
                            padding: 10px;
                            background-color: #f5f6f7;
                            width: 400px;
                            margin: 0 auto;
                        }
                        .container {
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            margin: 0 auto;
                            width: 100%;
                        }
                        .title {
                            text-align: center;
                            color: #28a745;
                            margin-bottom: 15px;
                            font-size: 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 5px;
                        }
                        .title::before {
                            content: "✓";
                            display: inline-block;
                            width: 18px;
                            height: 18px;
                            line-height: 18px;
                            background: #28a745;
                            color: white;
                            border-radius: 50%;
                            font-size: 12px;
                        }
                        .url {
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 5px;
                            color: #1a73e8;
                            word-break: break-all;
                            font-family: monospace;
                            font-size: 14px;
                        }
                        .tip {
                            color: #666;
                            font-size: 12px;
                            margin-top: 12px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title">解析成功</div>
                        <div class="url">${videoUrl}</div>
                        <div class="tip">复制链接到浏览器打开即可下载</div>
                    </div>
                </body>
                </html>
            `;

            const image = await ImageService.generateImage(htmlContent);
            await this.napcat.send_group_msg({
                group_id: context.group_id,
                message: [
                    {
                        type: 'image',
                        data: {
                            file: "base64://" + image,
                            subType: "0"
                        }
                    },
                    {
                        type: 'text',
                        data: {
                            text: videoUrl
                        }
                    }
                ]
            });
        } catch (err) {
            throw new Error(`解析失败：${err.message}`);
        }
    }
} 