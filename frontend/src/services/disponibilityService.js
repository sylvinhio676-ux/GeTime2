import api from "./api";

const ENDPOINT = '/disponibilities';

export const disponibilityService = {
    //Get all disponibility
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  group: async (ids) => {
    try {
      const response = await api.post(`${ENDPOINT}/group`, { ids });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  ungroup: async (id, slotMinutes = 120) => {
    try {
      const response = await api.post(`${ENDPOINT}/ungroup`, { id, slot_minutes: slotMinutes });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  convertMultiple: async (ids) => {
    try {
      const response = await api.post(`${ENDPOINT}/convert-multiple`, { ids });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

    //Get single disponibility
    getById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //create disponibility
    create: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //update disponibility
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //convert availability into programmation
    convert: async (id, overrides = {}) => {
        try {
    const response = await api.post(`/admin${ENDPOINT}/${id}/convert`, overrides);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //delete disponibility
    delete: async (id) => {
        try {
            await api.delete(`${ENDPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}
