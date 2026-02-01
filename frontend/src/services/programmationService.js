import api from "./api";

const ENDPOINT = '/programmations';

export const programmationService = {
    //Get all programmation
    getAll: async (params = {}) => {
        try {
            const response = await api.get(ENDPOINT, { params });
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Get single programmation
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //create programmation
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //update programmation
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    publishValidated: async () => {
        try {
            const response = await api.post(`${ENDPOINT}/publish`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    suggest: async (payload) => {
        try {
            const response = await api.post(`${ENDPOINT}/suggest`, payload);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    validate: async (id) => {
        try {
            const response = await api.post(`${ENDPOINT}/${id}/validate`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //delete programmation
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}
