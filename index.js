import { Bot } from './core/index.js';
import { AppError, errorTypes } from './utils/AppError.js';
import { log, error } from './utils/logger.js';

// 捕获全局未处理的 Promise 异常
process.on('unhandledRejection', (reason, promise) => {
    if (reason instanceof AppError) {
        error('SYSTEM', '未处理的应用错误', {
            type: reason.type,
            message: reason.message,
            details: reason.details
        });
    } else {
        error('SYSTEM', '未处理的 Promise 异常', {
            error: reason?.message || String(reason),
            stack: reason?.stack
        });
    }
});

// 捕获全局未处理的异常
process.on('uncaughtException', (err) => {
    if (err instanceof AppError) {
        error('SYSTEM', '未处理的应用错误', {
            type: err.type,
            message: err.message,
            details: err.details
        });
    } else {
        error('SYSTEM', '未处理的异常', {
            error: err.message,
            stack: err.stack
        });
    }
});

try {
    // 启动机器人
    const bot = new Bot();
    bot.start().catch(err => {
        if (err instanceof AppError) {
            error('SYSTEM', '机器人启动失败', {
                type: err.type,
                message: err.message,
                details: err.details
            });
        } else {
            error('SYSTEM', '机器人启动失败', {
                error: err.message,
                stack: err.stack
            });
        }
        process.exit(1);
    });

    // 优雅关闭
    process.on('SIGINT', async () => {
        log('SYSTEM', '收到关闭信号，正在清理...');
        try {
            await bot.cleanup();
            log('SYSTEM', '清理完成，正在退出');
            process.exit(0);
        } catch (err) {
            error('SYSTEM', '清理失败', {
                error: err.message,
                stack: err.stack
            });
            process.exit(1);
        }
    });
} catch (err) {
    if (err instanceof AppError) {
        error('SYSTEM', '机器人初始化失败', {
            type: err.type,
            message: err.message,
            details: err.details
        });
    } else {
        error('SYSTEM', '机器人初始化失败', {
            error: err.message,
            stack: err.stack
        });
    }
    process.exit(1);
} 