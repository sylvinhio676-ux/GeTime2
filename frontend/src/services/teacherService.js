import api from './api';

const ENDPOINT = '/teachers';

export const teacherService = {
  // Get all teachers
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINT);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single teacher
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create teacher
  create: async (data) => {
    try {
      const response = await api.post(ENDPOINT, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update teacher
  update: async (id, data) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete teacher
  delete: async (id) => {
    try {
      await api.delete(`${ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
