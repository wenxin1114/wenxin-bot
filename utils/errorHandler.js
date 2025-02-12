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
    CONFIG_ERROR: 'CONFIG_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR'
};

export function handleApiError(error, apiName, userId, groupId) {
    const errorDetails = {
        userId,
        groupId,
        error: error.message,
        apiName
    };

    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.response.statusText;
        
        errorDetails.status = status;
        errorDetails.apiError = message;

        switch (status) {
            case 401:
                return new AppError(
                    errorTypes.AUTH_ERROR,
                    `${apiName} API 密钥无效`,
                    errorDetails
                );
            case 429:
                return new AppError(
                    errorTypes.RATE_LIMIT_ERROR,
                    `${apiName} API 调用次数超限`,
                    errorDetails
                );
            case 500:
                return new AppError(
                    errorTypes.API_ERROR,
                    `${apiName} 服务器错误`,
                    errorDetails
                );
            case 503:
                return new AppError(
                    errorTypes.API_ERROR,
                    `${apiName} 服务暂时不可用`,
                    errorDetails
                );
            default:
                return new AppError(
                    errorTypes.API_ERROR,
                    `${apiName} API 错误: ${status} - ${message}`,
                    errorDetails
                );
        }
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorDetails.code = error.code;
        return new AppError(
            errorTypes.NETWORK_ERROR,
            `${apiName} API 请求超时`,
            errorDetails
        );
    }

    if (error.code === 'ECONNREFUSED') {
        errorDetails.code = error.code;
        return new AppError(
            errorTypes.NETWORK_ERROR,
            `${apiName} API 连接被拒绝`,
            errorDetails
        );
    }

    return new AppError(
        errorTypes.API_ERROR,
        `${apiName} API 调用失败: ${error.message}`,
        errorDetails
    );
} 