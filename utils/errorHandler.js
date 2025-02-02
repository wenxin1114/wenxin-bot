export class AppError extends Error {
    constructor(type, message, details = {}) {
        super(message);
        this.type = type;
        this.details = details;
    }
}

export const errorTypes = {
    API_ERROR: 'API_ERROR',
    MODEL_ERROR: 'MODEL_ERROR',
    COMMAND_ERROR: 'COMMAND_ERROR',
    CONFIG_ERROR: 'CONFIG_ERROR'
}; 