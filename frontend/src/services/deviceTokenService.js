import api from "./api";

const ENDPOINT = "/device-token";

export const deviceTokenService = {
  list: async () => {
    const response = await api.get(ENDPOINT);
    return response.data.data || [];
  },
  delete: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response.data.data;
  },
};
