// 将命令处理器分离到单独的文件
import { MenuCommand } from './MenuCommand.js';
import { ModelCommand } from './ModelCommand.js';
import { ChatCommand } from './ChatCommand.js';
import { ClearHistoryCommand } from './ClearHistoryCommand.js';
import { HistoryCommand } from './HistoryCommand.js';
import { DouyinCommand } from './DouyinCommand.js';
import { HotSearchCommand } from './HotSearchCommand.js';
import { NewsCommand } from './NewsCommand.js';

export function createCommands(napcat, modelManager, config) {
    return [
        new MenuCommand(napcat, config),
        new ModelCommand(napcat, modelManager),
        new ChatCommand(napcat, modelManager),
        new ClearHistoryCommand(napcat, modelManager),
        new HistoryCommand(napcat, modelManager),
        new DouyinCommand(napcat),
        new HotSearchCommand(napcat),
        new NewsCommand(napcat)
    ];
} 