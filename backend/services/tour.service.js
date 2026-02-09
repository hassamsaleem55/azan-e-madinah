import Tour from '../models/Tour.js';

/**
 * Tour Service - Business logic for tour package management
 */

class TourService {
    // Create new tour
    async createTour(tourData, userId) {
        try {
            const tour = new Tour({
                ...tourData,
                createdBy: userId,
                updatedBy: userId
            });
            return await tour.save();
        } catch (error) {
            throw new Error(`Error creating tour: ${error.message}`);
        }
    }

    // Get all tours with filters
    async getTours(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
        try {
            const query = this._buildQuery(filters);
            const skip = (page - 1) * limit;

            const tours = await Tour.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Tour.countDocuments(query);

            return {
                tours,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching tours: ${error.message}`);
        }
    }

    // Get tour by ID
    async getTourById(tourId) {
        try {
            const tour = await Tour.findById(tourId)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!tour) {
                throw new Error('Tour not found');
            }

            return tour;
        } catch (error) {
            throw new Error(`Error fetching tour: ${error.message}`);
        }
    }

    // Get tour by slug
    async getTourBySlug(slug) {
        try {
            const tour = await Tour.findOne({ slug, status: 'Active' });

            if (!tour) {
                throw new Error('Tour not found');
            }

            return tour;
        } catch (error) {
            throw new Error(`Error fetching tour: ${error.message}`);
        }
    }

    // Update tour
    async updateTour(tourId, updateData, userId) {
        try {
            const tour = await Tour.findByIdAndUpdate(
                tourId,
                {
                    ...updateData,
                    updatedBy: userId
                },
                { new: true, runValidators: true }
            );

            if (!tour) {
                throw new Error('Tour not found');
            }

            return tour;
        } catch (error) {
            throw new Error(`Error updating tour: ${error.message}`);
        }
    }

    // Delete tour
    async deleteTour(tourId) {
        try {
            const tour = await Tour.findByIdAndDelete(tourId);
            
            if (!tour) {
                throw new Error('Tour not found');
            }

            return tour;
        } catch (error) {
            throw new Error(`Error deleting tour: ${error.message}`);
        }
    }

    // Get tours by country
    async getToursByCountry(country) {
        try {
            return await Tour.find({
                'destination.country': country,
                status: 'Active'
            })
                .sort('-reviews.averageRating')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching tours by country: ${error.message}`);
        }
    }

    // Get featured tours
    async getFeaturedTours(limit = 6) {
        try {
            return await Tour.find({ 
                status: 'Active', 
                isFeatured: true 
            })
                .sort('-reviews.averageRating')
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Error fetching featured tours: ${error.message}`);
        }
    }

    // Get tours by category
    async getToursByCategory(category) {
        try {
            return await Tour.find({
                category: category,
                status: 'Active'
            })
                .sort('-reviews.averageRating')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching tours by category: ${error.message}`);
        }
    }

    // Get tours by seasonal category
    async getToursBySeasonalCategory(seasonalCategory) {
        try {
            return await Tour.find({
                seasonalCategory: seasonalCategory,
                status: 'Active'
            })
                .sort('-reviews.averageRating')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching tours by seasonal category: ${error.message}`);
        }
    }

    // Helper method to build query
    _buildQuery(filters) {
        const query = {};

        if (filters.country) query['destination.country'] = filters.country;
        if (filters.type) query.type = filters.type;
        if (filters.category) query.category = filters.category;
        if (filters.seasonalCategory) query.seasonalCategory = filters.seasonalCategory;
        if (filters.status) query.status = filters.status;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        if (filters.isBestSeller !== undefined) query.isBestSeller = filters.isBestSeller;

        if (filters.minPrice || filters.maxPrice) {
            query['pricing.basePrice'] = {};
            if (filters.minPrice) query['pricing.basePrice'].$gte = filters.minPrice;
            if (filters.maxPrice) query['pricing.basePrice'].$lte = filters.maxPrice;
        }

        if (filters.minDays) query['duration.days'] = { $gte: filters.minDays };
        if (filters.maxDays) {
            query['duration.days'] = query['duration.days'] || {};
            query['duration.days'].$lte = filters.maxDays;
        }

        return query;
    }
}

export default new TourService();
