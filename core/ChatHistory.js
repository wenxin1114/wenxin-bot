export class ChatHistory {
    constructor(maxHistory = 10) {
        // 使用 Map 存储每个用户的对话历史
        // key: user_id-group_id, value: message array
        this.history = new Map();
        this.maxHistory = maxHistory;
    }

    // 获取用户的对话历史
    getHistory(userId, groupId) {
        const key = `${userId}-${groupId}`;
        if (!this.history.has(key)) {
            this.history.set(key, []);
        }
        return this.history.get(key);
    }

    // 添加新的对话
    addMessage(userId, groupId, role, content) {
        const history = this.getHistory(userId, groupId);
        history.push({ role, content });
        
        // 保持历史记录在最大限制内
        while (history.length > this.maxHistory) {
            history.shift();
        }
    }

    // 清除用户的对话历史
    clearHistory(userId, groupId) {
        const key = `${userId}-${groupId}`;
        this.history.delete(key);
    }

    // 获取格式化的历史记录
    getFormattedHistory(userId, groupId) {
        const history = this.getHistory(userId, groupId);
        if (!history || history.length === 0) {
            return null;
        }
        return history;
    }

    getCache() {
        const cache = {};
        // 遍历所有历史记录
        this.history.forEach((messages, key) => {
            const [userId, groupId] = key.split('-');
            if (!cache[userId]) {
                cache[userId] = {};
            }
            cache[userId][groupId] = messages;
        });
        return cache;
    }

    loadFromCache(cache) {
        this.history.clear();
        // 恢复所有历史记录
        Object.entries(cache).forEach(([userId, groups]) => {
            Object.entries(groups).forEach(([groupId, messages]) => {
                const key = `${userId}-${groupId}`;
                this.history.set(key, messages);
            });
        });
    }
} 