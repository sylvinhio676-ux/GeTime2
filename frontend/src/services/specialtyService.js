import api from "./api";

const ENDPOINT = '/specialties';

export const specialtyService = {
    //Get all specialty
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Get single specialty
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //create specialty
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //update specialty
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || data;
        }
    },

    //delete specialty
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}