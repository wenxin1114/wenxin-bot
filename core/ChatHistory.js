export class ChatHistory {
    constructor(maxHistory = 20) {
        // 使用 Map 存储每个用户的对话历史
        // key: user_id-group_id, value: message array
        this.history = new Map();
        this.maxHistory = maxHistory;
    }

    // 清除指定用户的对话历史
    clearHistory(userId, groupId) {
        const key = `${userId}-${groupId}`;
        this.history.set(key, []);
    }

    // 获取用户的对话历史
    getHistory(userId, groupId) {
        const key = `${userId}-${groupId}`;
        if (!this.history.has(key)) {
            this.history.set(key, []);
        }
        return this.history.get(key);
    }

    // 添加消息到历史记录
    addMessage(userId, groupId, role, content) {
        const history = this.getHistory(userId, groupId);
        history.push({
            role: role,
            content: content
        });

        // 保持历史记录不超过最大长度
        if (history.length > this.maxHistory) {
            history.shift();
        }
    }

    // 获取格式化的历史记录
    getFormattedHistory(userId, groupId) {
        return this.getHistory(userId, groupId).map((msg, index) => ({
            ...msg,
            index: index + 1
        }));
    }

    // 获取缓存格式
    getCache() {
        const cache = {};
        this.history.forEach((messages, key) => {
            const [userId, groupId] = key.split('-');
            if (!cache[userId]) {
                cache[userId] = {};
            }
            cache[userId][groupId] = messages;
        });
        return cache;
    }

    // 从缓存加载
    loadFromCache(cache) {
        this.history.clear();
        Object.entries(cache).forEach(([userId, groups]) => {
            Object.entries(groups).forEach(([groupId, messages]) => {
                const key = `${userId}-${groupId}`;
                this.history.set(key, messages);
            });
        });
    }
} 