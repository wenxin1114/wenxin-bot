import { Structs } from "node-napcat-ts";
import { log, error } from '../../utils/logger.js';

export class BaseCommand {
    constructor(command, description) {
        this.command = command;
        this.description = description;
        this.napcat = null;  // 初始化为 null
    }

    // 添加 setter 方法
    setNapcat(napcat) {
        this.napcat = napcat;
    }

    async execute(args, context) {
        throw new Error('Command execute method not implemented');
    }

    matches(command) {
        return command === this.command;
    }

    // 发送回复消息的辅助方法
    async sendReply(context, content, options = {}) {
        if (!this.napcat) {
            throw new Error('napcat not initialized');
        }

        const message = [];
        
        // 添加回复引用 - 除非明确指定 noReply
        if (context.message_id && !options.noReply) {
            log('MESSAGE', '添加回复引用', {
                message_id: context.message_id,
                group_id: context.group_id
            });
            message.push({
                type: 'reply',
                data: {
                    id: context.message_id
                }
            });
        }

        // 添加文本内容
        if (content) {
            if (typeof content === 'string') {
                message.push({
                    type: 'text',
                    data: {
                        text: content
                    }
                });
            } else if (Array.isArray(content)) {
                message.push(...content);
            } else {
                message.push(content);
            }
        }

        // 添加图片 - 移除了 noReply 的判断，让图片消息也能有回复
        if (options.image) {
            message.push({
                type: 'image',
                data: {
                    file: options.image,
                    subType: "0"
                }
            });
        }

        // 记录发送的消息
        log('MESSAGE', '发送消息', {
            group_id: context.group_id,
            message_type: message.map(m => m.type).join(','),
            content_preview: content ? (typeof content === 'string' ? content.slice(0, 50) : '[复杂消息]') : '',
            has_image: !!options.image,
            has_reply: !!(context.message_id && !options.noReply)
        });

        try {
            await this.napcat.send_group_msg({
                group_id: context.group_id,
                message: message
            });
        } catch (err) {
            error('MESSAGE', '消息发送失败', {
                error: err.message,
                group_id: context.group_id,
                message_type: message.map(m => m.type).join(',')
            });
            throw err;
        }
    }
} 