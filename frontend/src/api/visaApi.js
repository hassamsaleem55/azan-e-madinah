import axiosInstance from './axios';

export const visaApi = {
    // Get all visas with filters
    getVisas: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/visas', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get visa by ID or slug
    getVisaById: async (id) => {
        try {
            const response = await axiosInstance.get(`/visas/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get popular visas
    getPopularVisas: async () => {
        try {
            const response = await axiosInstance.get('/visas/popular');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Submit visa application
    submitApplication: async (applicationData) => {
        try {
            const response = await axiosInstance.post('/visas/applications', applicationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default visaApi;
