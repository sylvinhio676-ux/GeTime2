import api from "./api";

const ENDPOINT = "/audit-logs";

export const auditLogService = {
  list: async (params = {}) => {
    const response = await api.get(ENDPOINT, { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || {},
    };
  },
};
