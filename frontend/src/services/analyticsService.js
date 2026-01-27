import api from "./api";

const BASE = "/analytics";

export const analyticsService = {
  getUsageMetrics: async () => {
    const response = await api.get(`${BASE}/usage`);
    return response.data.data;
  },
  getTopCampuses: async () => {
    const response = await api.get(`${BASE}/routes`);
    return response.data.data?.campuses || [];
  },
  getRecentSessions: async () => {
    const response = await api.get(`${BASE}/recent-sessions`);
    return response.data.data?.sessions || [];
  },
};
