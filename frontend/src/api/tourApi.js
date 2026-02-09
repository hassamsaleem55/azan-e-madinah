import axiosInstance from './axios';

export const tourApi = {
    // Get all tours with filters
    getTours: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/tours', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get tour by ID or slug
    getTourById: async (id) => {
        try {
            const response = await axiosInstance.get(`/tours/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get featured tours
    getFeaturedTours: async () => {
        try {
            const response = await axiosInstance.get('/tours/featured');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default tourApi;
