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
};
