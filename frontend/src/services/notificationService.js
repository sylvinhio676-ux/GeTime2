import api from "./api";

const ENDPOINT = "/notifications";

export const notificationService = {
  list: async () => {
    const response = await api.get(ENDPOINT);
    return response.data.data || [];
  },
  unread: async () => {
    const response = await api.get(`${ENDPOINT}/unread`);
    return response.data.data || [];
  },
  markRead: async (id) => {
    const response = await api.patch(`${ENDPOINT}/${id}/read`);
    return response.data.data;
  },
  markAllRead: async () => {
    const response = await api.post(`${ENDPOINT}/read-all`);
    return response.data;
  },
  stats: async () => {
    const response = await api.get(`${ENDPOINT}/stats`);
    return response.data.data || {};
  },
  templates: async () => {
    const response = await api.get(`${ENDPOINT}/templates`);
    return response.data.data || [];
  },
  archive: async (id) => {
    const response = await api.patch(`${ENDPOINT}/${id}/archive`);
    return response.data.data;
  },
  destroy: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data.data;
  },
  schedule: async (payload) => {
    const response = await api.post(`${ENDPOINT}/schedule`, payload);
    return response.data.data;
  },
  push: async (payload) => {
    const response = await api.post(`${ENDPOINT}/push`, payload);
    return response.data.data;
  },
};
