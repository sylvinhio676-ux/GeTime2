import api from "./api";

const ENDPOINT = '/quota';

export const quotaService = {
    // Get overall quota stats
    getStats: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/stats`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}