import axiosInstance from './axios';

export const contentApi = {
    // Get content by page key
    getPageContent: async (pageKey) => {
        try {
            const response = await axiosInstance.get(`/content/page/${pageKey}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get published testimonials
    getTestimonials: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/testimonials/public', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Submit testimonial
    submitTestimonial: async (testimonialData) => {
        try {
            const response = await axiosInstance.post('/testimonials', testimonialData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default contentApi;
