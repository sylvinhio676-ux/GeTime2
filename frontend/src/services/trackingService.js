import api from './api';

const ENDPOINT = '/tracking/path';

export const trackingService = {
  savePath: async (payload) => {
    try {
      const response = await api.post(ENDPOINT, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
