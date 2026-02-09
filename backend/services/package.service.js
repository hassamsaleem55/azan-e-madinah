import Package from '../models/Package.js';

/**
 * Package Service - Business logic for package management
 */

class PackageService {
    // Create new package
    async createPackage(packageData, userId) {
        try {
            const packageDoc = new Package({
                ...packageData,
                createdBy: userId,
                updatedBy: userId
            });
            return await packageDoc.save();
        } catch (error) {
            throw new Error(`Error creating package: ${error.message}`);
        }
    }

    // Get all packages with filters
    async getPackages(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
        try {
            const query = this._buildQuery(filters);
            const skip = (page - 1) * limit;

            const packages = await Package.find(query)
                .populate('accommodations.hotel', 'name location starRating images')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Package.countDocuments(query);

            return {
                packages,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching packages: ${error.message}`);
        }
    }

    // Get package by ID
    async getPackageById(packageId) {
        try {
            const packageDoc = await Package.findById(packageId)
                .populate('accommodations.hotel')
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!packageDoc) {
                throw new Error('Package not found');
            }

            return packageDoc;
        } catch (error) {
            throw new Error(`Error fetching package: ${error.message}`);
        }
    }

    // Get package by slug
    async getPackageBySlug(slug) {
        try {
            const packageDoc = await Package.findOne({ slug, status: 'Active' })
                .populate('accommodations.hotel');

            if (!packageDoc) {
                throw new Error('Package not found');
            }

            return packageDoc;
        } catch (error) {
            throw new Error(`Error fetching package: ${error.message}`);
        }
    }

    // Update package
    async updatePackage(packageId, updateData, userId) {
        try {
            const packageDoc = await Package.findByIdAndUpdate(
                packageId,
                {
                    ...updateData,
                    updatedBy: userId
                },
                { new: true, runValidators: true }
            );

            if (!packageDoc) {
                throw new Error('Package not found');
            }

            return packageDoc;
        } catch (error) {
            throw new Error(`Error updating package: ${error.message}`);
        }
    }

    // Delete package
    async deletePackage(packageId) {
        try {
            const packageDoc = await Package.findByIdAndDelete(packageId);
            
            if (!packageDoc) {
                throw new Error('Package not found');
            }

            return packageDoc;
        } catch (error) {
            throw new Error(`Error deleting package: ${error.message}`);
        }
    }

    // Get featured packages
    async getFeaturedPackages(limit = 6) {
        try {
            return await Package.find({ 
                status: 'Active', 
                isFeatured: true 
            })
                .populate('accommodations.hotel', 'name location starRating')
                .sort('-createdAt')
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Error fetching featured packages: ${error.message}`);
        }
    }

    // Search packages
    async searchPackages(searchTerm, filters = {}) {
        try {
            const query = {
                $text: { $search: searchTerm },
                status: 'Active',
                ...this._buildQuery(filters)
            };

            return await Package.find(query)
                .populate('accommodations.hotel', 'name location starRating')
                .sort({ score: { $meta: 'textScore' } })
                .lean();
        } catch (error) {
            throw new Error(`Error searching packages: ${error.message}`);
        }
    }

    // Get packages by departure city
    async getPackagesByCity(city) {
        try {
            return await Package.find({
                departureCities: city,
                status: 'Active'
            })
                .populate('accommodations.hotel', 'name location starRating')
                .sort('-createdAt')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching packages by city: ${error.message}`);
        }
    }

    // Update availability
    async updateAvailability(packageId, availabilityData) {
        try {
            const packageDoc = await Package.findByIdAndUpdate(
                packageId,
                { availability: availabilityData },
                { new: true, runValidators: true }
            );

            if (!packageDoc) {
                throw new Error('Package not found');
            }

            return packageDoc;
        } catch (error) {
            throw new Error(`Error updating availability: ${error.message}`);
        }
    }

    // Helper method to build query
    _buildQuery(filters) {
        const query = {};

        if (filters.type) query.type = filters.type;
        if (filters.status) query.status = filters.status;
        if (filters.departureCities) query.departureCities = { $in: Array.isArray(filters.departureCities) ? filters.departureCities : [filters.departureCities] };
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        if (filters.minPrice || filters.maxPrice) {
            query['pricing.price'] = {};
            if (filters.minPrice) query['pricing.price'].$gte = filters.minPrice;
            if (filters.maxPrice) query['pricing.price'].$lte = filters.maxPrice;
        }
        if (filters.minDays) query['duration.days'] = { $gte: filters.minDays };
        if (filters.maxDays) {
            query['duration.days'] = query['duration.days'] || {};
            query['duration.days'].$lte = filters.maxDays;
        }

        return query;
    }
}

export default new PackageService();
