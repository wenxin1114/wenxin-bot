import OpenAI from "openai";

export class ModelManager {
    constructor(config) {
        this.config = config;
        this.modelHandlers = {
            spark: this.handleSparkChat.bind(this),
            deepSeek: this.handleDeepSeekChat.bind(this)
        };
    }

    async handleSparkChat(message) {
        try {
            const response = await fetch('https://spark-api-open.xf-yun.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.model.spark.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "model": "generalv3.5",
                    "messages": [
                        {
                            "role": "system",
                            "content": this.config.model.spark.systemPrompt
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
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
                throw new Error(`星火API请求失败: ${data.message || response.statusText}`);
            }
            if (data.code === 0 && data.choices?.length > 0) {
                return data.choices[0].message.content;
            }
            throw new Error('星火API返回异常');
        } catch (error) {
            throw new Error(`星火API错误: ${error.message}`);
        }
    }

    async handleDeepSeekChat(message) {
        try {
            const openai = new OpenAI({
                baseURL: 'https://api.deepseek.com',
                apiKey: this.config.model.deepSeek.apiKey
            });

            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system", 
                        content: this.config.model.deepSeek.systemPrompt
                    },
                    {
                        role: "user", 
                        content: message
                    }
                ],
                model: "deepseek-chat",
            });
            return completion.choices[0].message.content;
        } catch (error) {
            throw new Error(`DeepSeek API错误: ${error.message}`);
        }
    }

    async chat(message) {
        const handler = this.modelHandlers[this.config.currentModel];
        if (!handler) {
            throw new Error(`未实现的模型接口: ${this.config.currentModel}`);
        }
        return await handler(message);
    }

    getAvailableModels() {
        return Object.keys(this.config.model);
    }

    getCurrentModel() {
        return this.config.currentModel;
    }

    getSystemPrompt() {
        return this.config.model[this.config.currentModel].systemPrompt;
    }

    setSystemPrompt(prompt) {
        this.config.model[this.config.currentModel].systemPrompt = prompt;
    }

    setModel(modelName) {
        if (!this.config.model[modelName]) {
            throw new Error(`未找到${modelName}模型`);
        }
        this.config.currentModel = modelName;
    }
} 