import api from "./api";

const ENDPOINT = '/emails';

export const emailService = {
  // Send email
  send: async (data) => {
    try {
      const response = await api.post(ENDPOINT, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // List emails by folder
  list: async (folder = 'sent') => {
    try {
      const response = await api.get(ENDPOINT, { params: { folder } });
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  markRead: async (id) => {
    try {
      const response = await api.patch(`${ENDPOINT}/${id}/read`);
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  sync: async () => {
    try {
      const response = await api.get(`${ENDPOINT}/sync`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
