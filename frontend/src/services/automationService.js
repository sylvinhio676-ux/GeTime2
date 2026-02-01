import api from "./api";

const BASE = "/automation/report";

export const automationService = {
  getLatestRun: async () => {
    const response = await api.get(`${BASE}/latest`);
    return response.data.data;
  },
  getRuns: async () => {
    const response = await api.get(`${BASE}/runs`);
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get(`${BASE}/stats`);
    return response.data.data;
  },
};
