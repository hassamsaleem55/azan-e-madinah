import axiosInstance from './axios';

export const hotelApi = {
    // Get all hotels with filters
    getHotels: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/hotels', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get hotel by ID or slug
    getHotelById: async (id) => {
        try {
            const response = await axiosInstance.get(`/hotels/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get featured hotels
    getFeaturedHotels: async () => {
        try {
            const response = await axiosInstance.get('/hotels/featured');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default hotelApi;
