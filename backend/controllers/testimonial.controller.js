import testimonialService from '../services/testimonial.service.js';

/**
 * Testimonial Controller - Handle HTTP requests for testimonials
 */

// Create testimonial
export const createTestimonial = async (req, res) => {
    try {
        const testimonial = await testimonialService.createTestimonial(
            req.body,
            req.user?._id || null
        );
        res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully. It will be reviewed shortly.',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all testimonials (admin)
export const getTestimonials = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
        
        const result = await testimonialService.getTestimonials(
            filters,
            parseInt(page),
            parseInt(limit),
            sort
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get published testimonials (public)
export const getPublishedTestimonials = async (req, res) => {
    try {
        const { limit = 10, serviceType } = req.query;
        const testimonials = await testimonialService.getPublishedTestimonials(
            parseInt(limit),
            serviceType
        );
        res.status(200).json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get testimonial by ID
export const getTestimonialById = async (req, res) => {
    try {
        const testimonial = await testimonialService.getTestimonialById(req.params.id);
        res.status(200).json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Approve testimonial
export const approveTestimonial = async (req, res) => {
    try {
        const testimonial = await testimonialService.approveTestimonial(
            req.params.id,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Testimonial approved successfully',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Reject testimonial
export const rejectTestimonial = async (req, res) => {
    try {
        const { reason } = req.body;
        const testimonial = await testimonialService.rejectTestimonial(
            req.params.id,
            req.user._id,
            reason
        );
        res.status(200).json({
            success: true,
            message: 'Testimonial rejected',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Add response to testimonial
export const addResponse = async (req, res) => {
    try {
        const { response } = req.body;
        const testimonial = await testimonialService.addResponse(
            req.params.id,
            response,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
    try {
        const testimonial = await testimonialService.toggleFeatured(req.params.id);
        res.status(200).json({
            success: true,
            message: `Testimonial ${testimonial.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        await testimonialService.deleteTestimonial(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
