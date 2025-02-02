export class BaseCommand {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    async execute(args, context) {
        throw new Error('Command execute method not implemented');
    }

    matches(command) {
        return command === this.name;
    }
} 