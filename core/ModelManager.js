import OpenAI from "openai";
import { ChatHistory } from "./ChatHistory.js";
import { CacheManager } from './CacheManager.js';
import { log, error } from '../utils/logger.js';
import { handleApiError } from '../utils/errorHandler.js';
import { AppError, errorTypes } from '../utils/AppError.js';

export class ModelManager {
    constructor(config) {
        this.config = config;
        this.cacheManager = new CacheManager();
        this.modelHandlers = {
            spark: this.handleSparkChat.bind(this),
            deepSeek: this.handleDeepSeekChat.bind(this)
        };
        this.chatHistory = new ChatHistory();
        
        // 用户模型设置
        this.userSettings = new Map();
        
        // 异步初始化
        this.initialized = this.loadState().catch(err => {
            error('MODEL', '加载状态失败', { error: err.message });
        });

        // 每5分钟自动保存一次状态
        this.autoSaveInterval = setInterval(() => {
            this.saveState().catch(err => {
                error('MODEL', '自动保存状态失败', { error: err.message });
            });
        }, 5 * 60 * 1000);

        // 每天凌晨3点清理过期设置
        this.cleanupInterval = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 3 && now.getMinutes() === 0) {
                this.cleanupInactiveSettings().catch(err => {
                    error('MODEL', '清理过期设置失败', { error: err.message });
                });
            }
        }, 60 * 1000); // 每分钟检查一次
    }

    // 获取用户的完整设置信息
    getUserInfo(userId, groupId) {
        const settings = this.getUserSettings(userId, groupId);
        const history = this.chatHistory.getHistory(userId, groupId);
        return {
            currentModel: settings.currentModel,
            systemPrompts: settings.systemPrompts,
            historyCount: history.length,
            lastActive: new Date().toISOString()
        };
    }

    // 获取用户设置
    getUserSettings(userId, groupId) {
        const key = `${userId}-${groupId}`;
        if (!this.userSettings.has(key)) {
            log('MODEL', '创建新用户设置', { 
                userId, 
                groupId,
                defaultModel: 'spark',
                timestamp: new Date().toISOString()
            });
            this.userSettings.set(key, {
                currentModel: 'spark',
                systemPrompts: {
                    spark: this.config.model.spark.systemPrompt,
                    deepSeek: this.config.model.deepSeek.systemPrompt
                },
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            });
        } else {
            // 更新最后活动时间
            const settings = this.userSettings.get(key);
            settings.lastActive = new Date().toISOString();
        }
        return this.userSettings.get(key);
    }

    async loadState() {
        try {
            // 加载历史记录
            const history = await this.cacheManager.loadCache('chat_history', {});
            if (history) {
                this.chatHistory.loadFromCache(history);
            }

            // 加载用户设置
            const settings = await this.cacheManager.loadCache('user_settings', {});
            this.userSettings.clear();
            Object.entries(settings).forEach(([key, value]) => {
                this.userSettings.set(key, value);
            });
        } catch (err) {
            throw new AppError(
                errorTypes.INIT_ERROR,
                '加载状态失败',
                {
                    error: err.message,
                    stack: err.stack
                }
            );
        }
    }

    async saveState() {
        // 保存历史记录
        await this.cacheManager.saveCache('chat_history', this.chatHistory.getCache());

        // 保存用户设置
        const settings = {};
        this.userSettings.forEach((value, key) => {
            settings[key] = value;
        });
        await this.cacheManager.saveCache('user_settings', settings);
    }

    async handleSparkChat(message, userId, groupId) {
        try {
            const settings = this.getUserSettings(userId, groupId);
            log('API', '调用星火API', {
                userId,
                groupId,
                messageLength: message.length,
                systemPrompt: settings.systemPrompts.spark
            });

            const history = this.chatHistory.getHistory(userId, groupId);
            const messages = [];

            // 如果有系统提示词，添加到消息列表开头
            if (settings.systemPrompts.spark) {
                messages.push({
                    "role": "system",
                    "content": settings.systemPrompts.spark
                });
            }

            // 添加历史消息和当前消息
            messages.push(...history, {
                "role": "user",
                "content": message
            });

            const response = await fetch('https://spark-api-open.xf-yun.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.model.spark.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "model": "generalv3.5",
                    "messages": messages
                })
            });

            const data = await response.json();
            if (!response.ok) {
                error('API', '星火API返回错误', {
                    userId,
                    groupId,
                    status: response.status,
                    error: data.error?.message
                });
                throw new Error(data.error?.message || '请求失败');
            }

            log('API', '星火API调用成功', {
                userId,
                groupId,
                responseLength: data.choices[0].message.content.length
            });

            return data.choices[0].message.content;
        } catch (err) {
            const appError = handleApiError(err, '星火', userId, groupId);
            error('API', '星火API调用失败', appError.details);
            throw appError;
        }
    }

    async handleDeepSeekChat(message, userId, groupId) {
        try {
            const settings = this.getUserSettings(userId, groupId);
            log('API', '调用DeepSeek API', {
                userId,
                groupId,
                messageLength: message.length,
                systemPrompt: settings.systemPrompts.deepSeek
            });

            const history = this.chatHistory.getHistory(userId, groupId);
            const messages = [];

            // 如果有系统提示词，添加到消息列表开头
            if (settings.systemPrompts.deepSeek) {
                messages.push({
                    role: "system",
                    content: settings.systemPrompts.deepSeek
                });
            }

            // 添加历史消息和当前消息
            messages.push(...history, {
                role: "user",
                content: message
            });

            const openai = new OpenAI({
                baseURL: 'https://api.deepseek.com',
                apiKey: this.config.model.deepSeek.apiKey
            });

            const completion = await openai.chat.completions.create({
                model: "deepseek-chat",
                messages: messages,
                stream: false
            });

            if (!completion?.choices?.[0]?.message?.content) {
                throw new Error('API 返回数据格式错误');
            }

            log('API', 'DeepSeek API调用成功', {
                userId,
                groupId,
                responseLength: completion.choices[0].message.content.length
            });

            return completion.choices[0].message.content;
        } catch (err) {
            const appError = handleApiError(err, 'DeepSeek', userId, groupId);
            error('API', 'DeepSeek API调用失败', appError.details);
            throw appError;
        }
    }

    async chat(message, userId, groupId) {
        try {
            const settings = this.getUserSettings(userId, groupId);
            log('CHAT', '开始对话', {
                userId,
                groupId,
                model: settings.currentModel,
                messageLength: message.length
            });

            // 添加消息到历史记录
            this.chatHistory.addMessage(userId, groupId, 'user', message);

            // 获取当前用户的模型设置
            const handler = this.modelHandlers[settings.currentModel];
            
            if (!handler) {
                throw new AppError(
                    errorTypes.MODEL_ERROR,
                    `未实现的模型接口: ${settings.currentModel}`,
                    { userId, groupId, model: settings.currentModel }
                );
            }

            // 调用模型处理函数
            const response = await handler(message, userId, groupId);

            // 添加回复到历史记录
            this.chatHistory.addMessage(userId, groupId, 'assistant', response);

            // 保存状态
            await this.saveState();

            log('CHAT', '对话完成', {
                userId,
                groupId,
                model: settings.currentModel,
                responseLength: response.length
            });

            return response;
        } catch (err) {
            error('CHAT', '对话失败', {
                userId,
                groupId,
                error: err.message,
                errorType: err.type || 'UNKNOWN'
            });

            // 根据错误类型返回友好的错误消息
            let userMessage = '服务器异常，请稍后重试';
            
            if (err instanceof AppError) {
                switch (err.type) {
                    case errorTypes.AUTH_ERROR:
                        userMessage = '服务器认证失败，请联系管理员';
                        break;
                    case errorTypes.RATE_LIMIT_ERROR:
                        userMessage = '接口调用次数超限，请稍后重试';
                        break;
                    case errorTypes.NETWORK_ERROR:
                        userMessage = '网络连接异常，请稍后重试';
                        break;
                    case errorTypes.MODEL_ERROR:
                        userMessage = '模型服务异常，请稍后重试';
                        break;
                    // 其他错误类型保持默认消息
                }
            }

            throw new AppError(
                err.type || errorTypes.MODEL_ERROR,
                userMessage,
                {
                    userId,
                    groupId,
                    originalError: err.message,
                    originalType: err.type
                }
            );
        }
    }

    // 清除用户的对话历史
    clearHistory(userId, groupId) {
        this.chatHistory.clearHistory(userId, groupId);
        this.saveState();  // 保存状态
    }

    getCurrentModel(userId, groupId) {
        return this.getUserSettings(userId, groupId).currentModel;
    }

    getAvailableModels() {
        return Object.keys(this.config.model);
    }

    getSystemPrompt(userId, groupId) {
        const settings = this.getUserSettings(userId, groupId);
        return settings.systemPrompts[settings.currentModel];
    }

    setSystemPrompt(userId, groupId, prompt) {
        const settings = this.getUserSettings(userId, groupId);
        const currentModel = settings.currentModel;
        const oldPrompt = settings.systemPrompts[currentModel];

        // 只有当提示词真的改变时才清空历史
        if (oldPrompt !== prompt) {
            settings.systemPrompts[currentModel] = prompt;
            
            // 清空该用户的聊天记录
            this.chatHistory.clearHistory(userId, groupId);
            
            log('MODEL', '更新系统提示词并清空历史', {
                userId,
                groupId,
                model: currentModel,
                prompt: prompt.slice(0, 50) + '...'  // 只记录前50个字符
            });
            
            this.saveState();
            
            // 返回一个提示信息
            return '提示词已更新，历史对话已清空';
        }
        
        // 如果提示词没有改变，返回 null 表示无变化
        return null;
    }

    setModel(userId, groupId, modelName) {
        if (!this.config.model[modelName]) {
            throw new AppError(
                errorTypes.VALIDATION_ERROR,
                `未找到${modelName}模型`,
                {
                    userId,
                    groupId,
                    modelName,
                    availableModels: Object.keys(this.config.model)
                }
            );
        }
        const settings = this.getUserSettings(userId, groupId);
        const oldModel = settings.currentModel;
        settings.currentModel = modelName;
        
        log('MODEL', '切换模型', {
            userId,
            groupId,
            from: oldModel,
            to: modelName
        });
        this.saveState();
    }

    // 添加一个等待初始化完成的方法
    async waitForInit() {
        await this.initialized;
    }

    // 修改 cleanup 方法
    async cleanup() {
        try {
            // 清理定时器
            clearInterval(this.autoSaveInterval);
            clearInterval(this.cleanupInterval);
            
            // 最后保存一次状态
            await this.saveState();
            
            log('MODEL', '清理完成');
        } catch (err) {
            error('MODEL', '清理失败', {
                error: err.message,
                stack: err.stack
            });
            throw err;
        }
    }

    // 清理超过指定天数未活动的用户设置
    async cleanupInactiveSettings(days = 30) {
        const now = new Date();
        let cleanCount = 0;
        
        for (const [key, settings] of this.userSettings.entries()) {
            const lastActive = new Date(settings.lastActive);
            const diffDays = (now - lastActive) / (1000 * 60 * 60 * 24);
            
            if (diffDays > days) {
                this.userSettings.delete(key);
                cleanCount++;
                
                const [userId, groupId] = key.split('-');
                log('MODEL', '清理过期设置', {
                    userId,
                    groupId,
                    lastActive: settings.lastActive,
                    inactiveDays: Math.floor(diffDays)
                });
            }
        }
        
        if (cleanCount > 0) {
            await this.saveState();
            log('MODEL', '完成清理过期设置', { cleanCount });
        }
    }
} 