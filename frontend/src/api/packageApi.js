import axiosInstance from './axios';

export const packageApi = {
    // Get all packages with filters
    getPackages: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/packages', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get package by ID or slug
    getPackageById: async (id) => {
        try {
            const response = await axiosInstance.get(`/packages/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get featured packages
    getFeaturedPackages: async () => {
        try {
            const response = await axiosInstance.get('/packages/featured');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Search packages
    searchPackages: async (searchTerm) => {
        try {
            const response = await axiosInstance.get('/packages', {
                params: { search: searchTerm }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default packageApi;
