import dotenv from 'dotenv';
import { AppError, errorTypes } from '../utils/errorHandler.js';

export class Config {
    constructor() {
        dotenv.config();
        this.validateConfig();
        
        this.bot = {
            name: process.env.BOT_NAME || "AI助手",
            accessToken: process.env.NAPCAT_ACCESS_TOKEN,
            master: process.env.BOT_MASTER,
            state: true
        };

        this.model = {
            spark: {
                apiKey: process.env.SPARK_API_KEY,
                systemPrompt: process.env.SPARK_SYSTEM_PROMPT || "你是一个智能助手"
            },
            deepSeek: {
                apiKey: process.env.DEEPSEEK_API_KEY,
                systemPrompt: process.env.DEEPSEEK_SYSTEM_PROMPT || "你是一个智能助手"
            }
        };

        this.napcat = {
            protocol: "ws",
            host: process.env.NAPCAT_HOST || '127.0.0.1',
            port: process.env.NAPCAT_PORT || 6700,
            access_token: this.bot.accessToken
        };
    }

    validateConfig() {
        const requiredEnvVars = [
            'NAPCAT_ACCESS_TOKEN',
            'BOT_MASTER',
            'SPARK_API_KEY'
        ];

        const missing = requiredEnvVars.filter(key => !process.env[key]);
        if (missing.length) {
            throw new AppError(
                errorTypes.CONFIG_ERROR,
                '缺少必要的环境变量配置',
                { missing }
            );
        }
    }
} 