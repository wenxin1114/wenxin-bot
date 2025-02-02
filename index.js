import { Bot } from './main.js';

// 捕获全局未处理的 Promise 异常
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 捕获全局未处理的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

try {
    // 启动机器人
    const bot = new Bot();
    bot.start();
} catch (error) {
    console.error('Bot initialization failed:', error);
    process.exit(1);
} 