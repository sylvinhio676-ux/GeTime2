import api from './api';

const ENDPOINT = '/locations';

export const locationService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINT);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (data) => {
    try {
      const response = await api.post(ENDPOINT, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`${ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
