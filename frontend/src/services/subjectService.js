import api from "./api";

const ENDPOINT = '/subjects';

export const subjectService = {
    //Get all subject
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Get single subject
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //create subject
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //update subject
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //delete subject
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get quota status for subjects
    getQuotaStatus: async (params = {}) => {
        try {
            const response = await api.get(`${ENDPOINT}/quota-status`, { params });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get stats for a specific subject
    getStats: async (subjectId) => {
        try {
            const response = await api.get(`${ENDPOINT}/${subjectId}/quota`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}