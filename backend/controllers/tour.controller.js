import tourService from '../services/tour.service.js';

/**
 * Tour Controller - Handle HTTP requests for tours
 */

// Create tour
export const createTour = async (req, res) => {
    try {
        const tour = await tourService.createTour(req.body, req.user._id);
        res.status(201).json({
            success: true,
            message: 'Tour created successfully',
            data: tour
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all tours
export const getTours = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
        
        const result = await tourService.getTours(
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

// Get tour by ID
export const getTourById = async (req, res) => {
    try {
        const tour = await tourService.getTourById(req.params.id);
        res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get tour by slug
export const getTourBySlug = async (req, res) => {
    try {
        const tour = await tourService.getTourBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            data: tour
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update tour
export const updateTour = async (req, res) => {
    try {
        const tour = await tourService.updateTour(
            req.params.id,
            req.body,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Tour updated successfully',
            data: tour
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete tour
export const deleteTour = async (req, res) => {
    try {
        await tourService.deleteTour(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Tour deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get tours by country
export const getToursByCountry = async (req, res) => {
    try {
        const tours = await tourService.getToursByCountry(req.params.country);
        res.status(200).json({
            success: true,
            data: tours
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured tours
export const getFeaturedTours = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const tours = await tourService.getFeaturedTours(parseInt(limit));
        res.status(200).json({
            success: true,
            data: tours
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get tours by category
export const getToursByCategory = async (req, res) => {
    try {
        const tours = await tourService.getToursByCategory(req.params.category);
        res.status(200).json({
            success: true,
            data: tours
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get tours by seasonal category
export const getToursBySeasonalCategory = async (req, res) => {
    try {
        const tours = await tourService.getToursBySeasonalCategory(req.params.seasonalCategory);
        res.status(200).json({
            success: true,
            data: tours
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
