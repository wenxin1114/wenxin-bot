import winston from 'winston';
import path from 'path';

// 自定义日志格式
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, type, ...meta }) => {
        // 简化元数据输出
        const cleanMeta = { ...meta };
        delete cleanMeta.type; // 移除重复的 type
        const metaStr = Object.keys(cleanMeta).length ? 
            ' ' + JSON.stringify(cleanMeta, null, 2) : '';
        
        return `[${timestamp}] [${level}] [${type}] ${message}${metaStr}`;
    })
);

// 创建 logger 实例
const logger = winston.createLogger({
    level: 'info',
    format: customFormat,
    transports: [
        // 控制台输出 - 带颜色
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        // 记录到文件
        new winston.transports.File({ 
            filename: path.join('logs', `${new Date().toISOString().split('T')[0]}.log`),
            maxsize: 5242880, // 5MB
            maxFiles: 7, // 保留7天的日志
            tailable: true
        })
    ]
});

// 导出日志函数
export function log(type, message, meta = {}) {
    logger.info(message, { type, ...meta });
}

export function error(type, message, meta = {}) {
    logger.error(message, { type, ...meta });
}

export function warn(type, message, meta = {}) {
    logger.warn(message, { type, ...meta });
}

export function debug(type, message, meta = {}) {
    logger.debug(message, { type, ...meta });
} 