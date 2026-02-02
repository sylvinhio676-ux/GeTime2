import api from './api';

const ENDPOINT = '/campuses';

export const campusService = {
  // Get all campuses
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINT);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single campus
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create campus
  create: async (data) => {
    try {
      const response = await api.post(ENDPOINT, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update campus
  update: async (id, data) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete campus
  delete: async (id) => {
    try {
      await api.delete(`${ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getTeacherCampuses: async () => {
    try {
      const response = await api.get('/teacher/campuses');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
