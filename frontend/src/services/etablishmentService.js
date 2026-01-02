import { data } from "react-router-dom";
import api from "./api";

const ENDPOINT = '/etablishments';

export const etablishmentService = {
    //Get all etablishment
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data.data || [];
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Get single etablishment
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Create etablishment
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Update etablisment
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //delete etablishment
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}