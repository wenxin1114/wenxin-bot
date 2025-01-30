import schedule from 'node-schedule';
import { generateImage } from '../api/dailyNews.js';

export class TaskManager {
    constructor(napcat, config) {
        this.napcat = napcat;
        this.config = config;
        this.jobs = new Map();
    }

    // 启动所有定时任务
    startAllTasks() {
        // 每天早上 8 点发送新闻
        this.scheduleNewsTask('0 8 * * *');
    }

    // 停止所有定时任务
    stopAllTasks() {
        this.jobs.forEach(job => job.cancel());
        this.jobs.clear();
    }

    // 调度新闻任务
    scheduleNewsTask(cronExpression) {
        const job = schedule.scheduleJob(cronExpression, async () => {
            try {
                console.log('开始生成每日新闻...');
                const image = await generateImage();
                if (image) {
                    // 发送到所有配置的群
                    const group_list = await this.napcat.get_group_list(); 
                    for (let group of group_list) {
                        await this.napcat.send_group_msg({
                            group_id: group.group_id,
                            message: [
                                {
                                    type: 'image',
                                    data: {
                                        file: `base64://${image}`
                                    }
                                }
                            ]
                        });
                    }
                    console.log('每日新闻发送成功');
                }
            } catch (error) {
                console.error('发送每日新闻失败:', error);
            }
        });

        this.jobs.set('news', job);
    }
} 