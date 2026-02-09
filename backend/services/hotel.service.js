import Hotel from '../models/Hotel.js';

/**
 * Hotel Service - Business logic for hotel management
 */

class HotelService {
    // Create new hotel
    async createHotel(hotelData, userId) {
        try {
            const hotel = new Hotel({
                ...hotelData,
                createdBy: userId,
                updatedBy: userId
            });
            return await hotel.save();
        } catch (error) {
            throw new Error(`Error creating hotel: ${error.message}`);
        }
    }

    // Get all hotels with filters
    async getHotels(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
        try {
            const query = this._buildQuery(filters);
            const skip = (page - 1) * limit;

            const hotels = await Hotel.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Hotel.countDocuments(query);

            return {
                hotels,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching hotels: ${error.message}`);
        }
    }

    // Get hotel by ID
    async getHotelById(hotelId) {
        try {
            const hotel = await Hotel.findById(hotelId)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!hotel) {
                throw new Error('Hotel not found');
            }

            return hotel;
        } catch (error) {
            throw new Error(`Error fetching hotel: ${error.message}`);
        }
    }

    // Get hotel by slug
    async getHotelBySlug(slug) {
        try {
            const hotel = await Hotel.findOne({ slug, status: 'Active' });

            if (!hotel) {
                throw new Error('Hotel not found');
            }

            return hotel;
        } catch (error) {
            throw new Error(`Error fetching hotel: ${error.message}`);
        }
    }

    // Update hotel
    async updateHotel(hotelId, updateData, userId) {
        try {
            const hotel = await Hotel.findByIdAndUpdate(
                hotelId,
                {
                    ...updateData,
                    updatedBy: userId
                },
                { new: true, runValidators: true }
            );

            if (!hotel) {
                throw new Error('Hotel not found');
            }

            return hotel;
        } catch (error) {
            throw new Error(`Error updating hotel: ${error.message}`);
        }
    }

    // Delete hotel
    async deleteHotel(hotelId) {
        try {
            const hotel = await Hotel.findByIdAndDelete(hotelId);
            
            if (!hotel) {
                throw new Error('Hotel not found');
            }

            return hotel;
        } catch (error) {
            throw new Error(`Error deleting hotel: ${error.message}`);
        }
    }

    // Get hotels by city
    async getHotelsByCity(city, filters = {}) {
        try {
            const query = {
                'location.city': city,
                status: 'Active',
                ...this._buildQuery(filters)
            };

            return await Hotel.find(query)
                .sort('location.distanceFromHaram')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching hotels by city: ${error.message}`);
        }
    }

    // Get featured hotels
    async getFeaturedHotels(limit = 6) {
        try {
            return await Hotel.find({ 
                status: 'Active', 
                isFeatured: true 
            })
                .sort('-reviews.averageRating')
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Error fetching featured hotels: ${error.message}`);
        }
    }

    // Search hotels
    async searchHotels(searchTerm, filters = {}) {
        try {
            const query = {
                $text: { $search: searchTerm },
                status: 'Active',
                ...this._buildQuery(filters)
            };

            return await Hotel.find(query)
                .sort({ score: { $meta: 'textScore' } })
                .lean();
        } catch (error) {
            throw new Error(`Error searching hotels: ${error.message}`);
        }
    }

    // Helper method to build query
    _buildQuery(filters) {
        const query = {};

        if (filters.city) query['location.city'] = filters.city;
        if (filters.starRating) query.starRating = filters.starRating;
        if (filters.category) query.category = filters.category;
        if (filters.status) query.status = filters.status;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        
        if (filters.maxDistance) {
            query['location.distanceFromHaram'] = { $lte: filters.maxDistance };
        }
        
        if (filters.minPrice || filters.maxPrice) {
            query['roomTypes.pricePerNight'] = {};
            if (filters.minPrice) query['roomTypes.pricePerNight'].$gte = filters.minPrice;
            if (filters.maxPrice) query['roomTypes.pricePerNight'].$lte = filters.maxPrice;
        }

        // Amenities filter
        if (filters.amenities && filters.amenities.length > 0) {
            query['amenities.name'] = { $all: filters.amenities };
        }

        return query;
    }
}

export default new HotelService();
