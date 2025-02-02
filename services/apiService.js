import axios from 'axios';
import { AppError, errorTypes } from '../utils/errorHandler.js';

export class ApiService {
    static async request(config) {
        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            throw new AppError(
                errorTypes.API_ERROR,
                `API请求失败: ${error.message}`,
                { url: config.url, method: config.method }
            );
        }
    }
} 