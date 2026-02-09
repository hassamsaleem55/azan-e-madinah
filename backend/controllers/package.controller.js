import packageService from '../services/package.service.js';

/**
 * Package Controller - Handle HTTP requests for packages
 */

// Create package
export const createPackage = async (req, res) => {
    try {
        const packageData = await packageService.createPackage(req.body, req.user._id);
        res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: packageData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all packages
export const getPackages = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
        
        const result = await packageService.getPackages(
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

// Get package by ID
export const getPackageById = async (req, res) => {
    try {
        const packageData = await packageService.getPackageById(req.params.id);
        res.status(200).json({
            success: true,
            data: packageData
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get package by slug
export const getPackageBySlug = async (req, res) => {
    try {
        const packageData = await packageService.getPackageBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            data: packageData
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update package
export const updatePackage = async (req, res) => {
    try {
        const packageData = await packageService.updatePackage(
            req.params.id,
            req.body,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            data: packageData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete package
export const deletePackage = async (req, res) => {
    try {
        await packageService.deletePackage(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Package deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured packages
export const getFeaturedPackages = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const packages = await packageService.getFeaturedPackages(parseInt(limit));
        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get packages by city
export const getPackagesByCity = async (req, res) => {
    try {
        const packages = await packageService.getPackagesByCity(req.params.city);
        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Search packages
export const searchPackages = async (req, res) => {
    try {
        const { q, ...filters } = req.query;
        const packages = await packageService.searchPackages(q, filters);
        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
