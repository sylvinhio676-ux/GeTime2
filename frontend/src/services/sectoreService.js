import api from "./api";

const ENPOINT = '/sectors';

export const sectorService = {
    //Get All sector
    getAll: async () =>{
        try{
            const response = await api.get(ENPOINT);
            return response.data.data || [];
        }catch(error){
            throw error.response?.data || error;
        }
    },

    //Get single sector
    getById: async (id) => {
        try{
            const response = await api.get(`${ENPOINT}/${id}`);
            return response.data.data;
        } catch (error){
            throw error.response?.data || error;
        }
    },

    //Create sector
    create: async (data) => {
        try{
            const response = await api.post(ENPOINT, data);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    //Update sector
    update: async (id, data) => {
        try {
            const response = await api.put(`${ENPOINT}/${id}`, data);
            return response.data.data;
        } catch (error)  {
            throw error.response?.data || error;
        }
    },

    //Delete sector
    delete: async (id) => {
        try {
            await api.delete(`${ENPOINT}/${id}`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}