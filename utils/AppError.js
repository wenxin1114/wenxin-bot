export class AppError extends Error {
    constructor(type, message, details = {}) {
        super(message);
        this.type = type;
        this.details = details;
        this.name = 'AppError';
    }
}

export const errorTypes = {
    API_ERROR: 'API_ERROR',
    MODEL_ERROR: 'MODEL_ERROR',
    COMMAND_ERROR: 'COMMAND_ERROR',
    CONFIG_ERROR: 'CONFIG_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    CACHE_ERROR: 'CACHE_ERROR',
    INIT_ERROR: 'INIT_ERROR'
}; 