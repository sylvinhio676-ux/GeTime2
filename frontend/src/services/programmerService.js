import api from "./api";

const ENDPOINT = '/programmers';

export const programmersService = {
    //Get all programmer
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Get single programmer
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //create programmer
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //update programmer
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || data;
        }
    },

    //delete programmer
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}