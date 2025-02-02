import OpenAI from "openai";
import { ChatHistory } from "./ChatHistory.js";

export class ModelManager {
    constructor(config) {
        this.config = config;
        this.modelHandlers = {
            spark: this.handleSparkChat.bind(this),
            deepSeek: this.handleDeepSeekChat.bind(this)
        };
        this.chatHistory = new ChatHistory();
        this.currentModel = 'spark';
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
                    "messages": messages,
                    "tools": [
                        {
                            "type": "function",
                            "function": {}
                        },
                        {
                            "type": "web_search",
                            "web_search": {
                                "enable": true
                            }
                        }
                    ],
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                error('SPARK', '请求失败', {
                    status: response.status,
                    statusText: response.statusText,
                    data
                });
                throw new Error(`星火API请求失败: ${data.message || response.statusText}`);
            }
            if (data.code === 0 && data.choices?.length > 0) {
                const responseContent = data.choices[0].message.content;
                // 保存对话历史
                this.chatHistory.addMessage(userId, groupId, "user", message);
                this.chatHistory.addMessage(userId, groupId, "assistant", responseContent);
                return responseContent;
            }
            throw new Error('星火API返回异常');
        } catch (error) {
            error('SPARK', '调用出错', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`星火API错误: ${error.message}`);
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
                messages: messages,
                model: "deepseek-chat",
            });
            if (!completion.choices || !completion.choices.length) {
                error('DEEPSEEK', '请求失败', {
                    data: completion
                });
                throw new Error('DeepSeek API返回异常');
            }

            const responseContent = completion.choices[0].message.content;
            // 保存对话历史
            this.chatHistory.addMessage(userId, groupId, "user", message);
            this.chatHistory.addMessage(userId, groupId, "assistant", responseContent);
            return responseContent;
        } catch (error) {
            throw new Error(`DeepSeek API错误: ${error.message}`);
        }
    }

    async chat(message, userId, groupId) {
        const handler = this.modelHandlers[this.currentModel];
        if (!handler) {
            throw new Error(`未实现的模型接口: ${this.currentModel}`);
        }
        return await handler(message, userId, groupId);
    }

    // 清除用户的对话历史
    clearHistory(userId, groupId) {
        this.chatHistory.clearHistory(userId, groupId);
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
    }

    setModel(modelName) {
        if (!this.config.model[modelName]) {
            throw new Error(`未找到${modelName}模型`);
        }
        this.currentModel = modelName;
    }
} 