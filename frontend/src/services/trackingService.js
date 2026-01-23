import api from './api';

const ENDPOINT = '/tracking/path';

export const trackingService = {
  savePath: async (path) => {
    try {
      const response = await api.post(ENDPOINT, { path });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
