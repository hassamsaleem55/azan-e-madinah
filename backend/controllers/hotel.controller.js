import hotelService from '../services/hotel.service.js';

/**
 * Hotel Controller - Handle HTTP requests for hotels
 */

// Create hotel
export const createHotel = async (req, res) => {
    try {
        // Parse data from FormData if it exists
        let hotelData = req.body;
        if (req.body.data) {
            hotelData = JSON.parse(req.body.data);
        }
        
        // Handle uploaded images if any
        if (req.files && req.files.length > 0) {
            hotelData.images = req.files.map(file => ({
                url: file.path,
                caption: '',
                category: 'Exterior'
            }));
        }
        
        const hotel = await hotelService.createHotel(hotelData, req.user._id);
        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            hotel: hotel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all hotels
export const getHotels = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
        
        const result = await hotelService.getHotels(
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

// Get hotel by ID
export const getHotelById = async (req, res) => {
    try {
        const hotel = await hotelService.getHotelById(req.params.id);
        res.status(200).json({
            success: true,
            hotel: hotel
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get hotel by slug
export const getHotelBySlug = async (req, res) => {
    try {
        const hotel = await hotelService.getHotelBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update hotel
export const updateHotel = async (req, res) => {
    try {
        // Parse data from FormData if it exists
        let hotelData = req.body;
        if (req.body.data) {
            hotelData = JSON.parse(req.body.data);
        }
        
        // Handle uploaded images if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                caption: '',
                category: 'Exterior'
            }));
            // Merge with existing images from frontend
            hotelData.images = [...(hotelData.images || []), ...newImages];
        }
        
        const hotel = await hotelService.updateHotel(
            req.params.id,
            hotelData,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Hotel updated successfully',
            hotel: hotel
        });
    } catch (error) {
        console.error('Hotel update error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete hotel
export const deleteHotel = async (req, res) => {
    try {
        await hotelService.deleteHotel(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Hotel deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get hotels by city
export const getHotelsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const filters = req.query;
        const hotels = await hotelService.getHotelsByCity(city, filters);
        res.status(200).json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured hotels
export const getFeaturedHotels = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const hotels = await hotelService.getFeaturedHotels(parseInt(limit));
        res.status(200).json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Search hotels
export const searchHotels = async (req, res) => {
    try {
        const { q, ...filters } = req.query;
        const hotels = await hotelService.searchHotels(q, filters);
        res.status(200).json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
