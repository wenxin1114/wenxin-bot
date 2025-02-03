import OpenAI from "openai";
import { ChatHistory } from "./ChatHistory.js";
import { CacheManager } from './CacheManager.js';
import { log, error } from '../utils/logger.js';

export class ModelManager {
    constructor(config) {
        this.config = config;
        this.cacheManager = new CacheManager();
        this.modelHandlers = {
            spark: this.handleSparkChat.bind(this),
            deepSeek: this.handleDeepSeekChat.bind(this)
        };
        this.chatHistory = new ChatHistory();
        this.currentModel = 'spark';
        
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
    }

    async loadState() {
        // 加载历史记录
        const history = await this.cacheManager.loadCache('chat_history', {});
        if (history) {
            this.chatHistory.loadFromCache(history);
        }

        // 加载模型状态
        const state = await this.cacheManager.loadCache('model_state', {
            currentModel: 'spark',
            systemPrompts: {}
        });
        
        this.currentModel = state.currentModel;
        Object.entries(state.systemPrompts).forEach(([model, prompt]) => {
            if (this.config.model[model]) {
                this.config.model[model].systemPrompt = prompt;
            }
        });
    }

    async saveState() {
        // 保存历史记录
        await this.cacheManager.saveCache('chat_history', this.chatHistory.getCache());

        // 保存模型状态
        const systemPrompts = {};
        Object.entries(this.config.model).forEach(([model, config]) => {
            systemPrompts[model] = config.systemPrompt;
        });

        await this.cacheManager.saveCache('model_state', {
            currentModel: this.currentModel,
            systemPrompts
        });
    }

    async handleSparkChat(message, userId, groupId) {
        try {
            const history = this.chatHistory.getHistory(userId, groupId);
            const messages = [
                {
                    "role": "system",
                    "content": this.config.model.spark.systemPrompt
                },
                ...history,
                {
                    "role": "user",
                    "content": message
                }
            ];

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
                throw new Error(data.error?.message || '请求失败');
            }

            return data.choices[0].message.content;
        } catch (err) {
            throw new Error(`Spark API 调用失败: ${err.message}`);
        }
    }

    async handleDeepSeekChat(message, userId, groupId) {
        try {
            const history = this.chatHistory.getHistory(userId, groupId);
            const messages = [
                {
                    role: "system", 
                    content: this.config.model.deepSeek.systemPrompt
                },
                ...history,
                {
                    role: "user", 
                    content: message
                }
            ];

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

            return completion.choices[0].message.content;
        } catch (error) {
            // 更详细的错误信息
            let errorMessage = 'DeepSeek API 调用失败';
            if (error.response) {
                // API 返回了错误状态码
                const status = error.response.status;
                const message = error.response.data?.error?.message || error.response.statusText;
                
                if (status === 401) {
                    errorMessage = 'DeepSeek API 密钥无效';
                } else if (status === 429) {
                    errorMessage = 'DeepSeek API 调用次数超限';
                } else {
                    errorMessage += `: ${status} - ${message}`;
                }
            } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                errorMessage = 'DeepSeek API 请求超时';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = 'DeepSeek API 连接被拒绝';
            } else {
                errorMessage += `: ${error.message}`;
            }

            // 添加日志记录
            console.error('DeepSeek API Error:', {
                error: error,
                response: error.response?.data,
                status: error.response?.status
            });

            throw new Error(errorMessage);
        }
    }

    async chat(message, userId, groupId) {
        try {
            // 添加消息到历史记录
            this.chatHistory.addMessage(userId, groupId, 'user', message);

            // 获取当前模型的处理函数
            const handler = this.modelHandlers[this.currentModel];
            if (!handler) {
                throw new Error(`未实现的模型接口: ${this.currentModel}`);
            }

            // 调用模型处理函数
            const response = await handler(message, userId, groupId);

            // 添加回复到历史记录
            this.chatHistory.addMessage(userId, groupId, 'assistant', response);

            // 保存状态
            await this.saveState();

            return response;
        } catch (err) {
            // 确保错误是字符串
            const errorMessage = err.message || '未知错误';
            throw new Error(errorMessage);
        }
    }

    // 清除用户的对话历史
    clearHistory(userId, groupId) {
        this.chatHistory.clearHistory(userId, groupId);
        this.saveState();  // 保存状态
    }

    getCurrentModel() {
        return this.currentModel;
    }

    getAvailableModels() {
        return Object.keys(this.config.model);
    }

    getSystemPrompt() {
        return this.config.model[this.currentModel]?.systemPrompt || "你是一个智能助手";
    }

    setSystemPrompt(prompt) {
        if (!this.currentModel) {
            throw new Error('未选择模型');
        }
        this.config.model[this.currentModel].systemPrompt = prompt;
        this.saveState();  // 保存状态
    }

    setModel(modelName) {
        if (!this.config.model[modelName]) {
            throw new Error(`未找到${modelName}模型`);
        }
        this.currentModel = modelName;
        this.saveState();  // 保存状态
    }

    // 添加一个等待初始化完成的方法
    async waitForInit() {
        await this.initialized;
    }

    // 添加清理方法
    async cleanup() {
        clearInterval(this.autoSaveInterval);
        await this.saveState();
    }
} 