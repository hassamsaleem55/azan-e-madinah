import visaService from '../services/visa.service.js';

/**
 * Visa Controller - Handle HTTP requests for visas
 */

// Create visa
export const createVisa = async (req, res) => {
    try {
        const visa = await visaService.createVisa(req.body, req.user._id);
        res.status(201).json({
            success: true,
            message: 'Visa created successfully',
            data: visa
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all visas
export const getVisas = async (req, res) => {
    try {
        const { page = 1, limit = 50, sort = 'country.name', ...filters } = req.query;
        
        const result = await visaService.getVisas(
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

// Get visa by ID
export const getVisaById = async (req, res) => {
    try {
        const visa = await visaService.getVisaById(req.params.id);
        res.status(200).json({
            success: true,
            data: visa
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get visa by slug
export const getVisaBySlug = async (req, res) => {
    try {
        const visa = await visaService.getVisaBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            data: visa
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update visa
export const updateVisa = async (req, res) => {
    try {
        const visa = await visaService.updateVisa(
            req.params.id,
            req.body,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Visa updated successfully',
            data: visa
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete visa
export const deleteVisa = async (req, res) => {
    try {
        await visaService.deleteVisa(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Visa deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get visas by country
export const getVisasByCountry = async (req, res) => {
    try {
        const visas = await visaService.getVisasByCountry(req.params.country);
        res.status(200).json({
            success: true,
            data: visas
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all countries
export const getAllCountries = async (req, res) => {
    try {
        const countries = await visaService.getAllCountries();
        res.status(200).json({
            success: true,
            data: countries
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured visas
export const getFeaturedVisas = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const visas = await visaService.getFeaturedVisas(parseInt(limit));
        res.status(200).json({
            success: true,
            data: visas
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
