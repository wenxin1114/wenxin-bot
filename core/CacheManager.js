import fs from 'fs/promises';
import path from 'path';
import { log, error } from '../utils/logger.js';

export class CacheManager {
    constructor(cacheDir = 'cache') {
        this.cacheDir = cacheDir;
        this.ensureCacheDir();
    }

    async ensureCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (err) {
            error('CACHE', '创建缓存目录失败', { error: err.message });
        }
    }

    async saveCache(key, data) {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            log('CACHE', `保存缓存: ${key}`, { size: JSON.stringify(data).length });
        } catch (err) {
            error('CACHE', `保存缓存失败: ${key}`, { error: err.message });
        }
    }

    async loadCache(key, defaultValue = null) {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            
            if (!exists) {
                log('CACHE', `缓存文件不存在: ${key}`, { defaultValue });
                return defaultValue;
            }

            const data = await fs.readFile(filePath, 'utf8');
            if (!data.trim()) {
                log('CACHE', `缓存文件为空: ${key}`, { defaultValue });
                return defaultValue;
            }

            try {
                const parsed = JSON.parse(data);
                log('CACHE', `加载缓存: ${key}`, { size: data.length });
                return parsed;
            } catch (parseError) {
                error('CACHE', `缓存文件解析失败: ${key}`, { 
                    error: parseError.message,
                    data: data.slice(0, 100) // 只记录前100个字符
                });
                // 备份损坏的文件
                const backupPath = path.join(this.cacheDir, `${key}.${Date.now()}.bak`);
                await fs.writeFile(backupPath, data);
                return defaultValue;
            }
        } catch (err) {
            error('CACHE', `加载缓存失败: ${key}`, { error: err.message });
            return defaultValue;
        }
    }
} 