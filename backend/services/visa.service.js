import Visa from '../models/Visa.js';

/**
 * Visa Service - Business logic for visa management
 */

class VisaService {
    // Create new visa
    async createVisa(visaData, userId) {
        try {
            const visa = new Visa({
                ...visaData,
                createdBy: userId,
                updatedBy: userId
            });
            return await visa.save();
        } catch (error) {
            throw new Error(`Error creating visa: ${error.message}`);
        }
    }

    // Get all visas with filters
    async getVisas(filters = {}, page = 1, limit = 50, sort = 'country.name') {
        try {
            const query = this._buildQuery(filters);
            const skip = (page - 1) * limit;

            const visas = await Visa.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Visa.countDocuments(query);

            return {
                visas,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching visas: ${error.message}`);
        }
    }

    // Get visa by ID
    async getVisaById(visaId) {
        try {
            const visa = await Visa.findById(visaId)
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            if (!visa) {
                throw new Error('Visa not found');
            }

            return visa;
        } catch (error) {
            throw new Error(`Error fetching visa: ${error.message}`);
        }
    }

    // Get visa by slug
    async getVisaBySlug(slug) {
        try {
            const visa = await Visa.findOne({ slug, status: 'Active' });

            if (!visa) {
                throw new Error('Visa not found');
            }

            return visa;
        } catch (error) {
            throw new Error(`Error fetching visa: ${error.message}`);
        }
    }

    // Update visa
    async updateVisa(visaId, updateData, userId) {
        try {
            const visa = await Visa.findByIdAndUpdate(
                visaId,
                {
                    ...updateData,
                    updatedBy: userId
                },
                { new: true, runValidators: true }
            );

            if (!visa) {
                throw new Error('Visa not found');
            }

            return visa;
        } catch (error) {
            throw new Error(`Error updating visa: ${error.message}`);
        }
    }

    // Delete visa
    async deleteVisa(visaId) {
        try {
            const visa = await Visa.findByIdAndDelete(visaId);
            
            if (!visa) {
                throw new Error('Visa not found');
            }

            return visa;
        } catch (error) {
            throw new Error(`Error deleting visa: ${error.message}`);
        }
    }

    // Get visas by country
    async getVisasByCountry(countryName) {
        try {
            return await Visa.find({
                'country.name': countryName,
                status: 'Active'
            })
                .sort('visaType')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching visas by country: ${error.message}`);
        }
    }

    // Get all countries with visas
    async getAllCountries() {
        try {
            const countries = await Visa.distinct('country.name', { status: 'Active' });
            return countries.sort();
        } catch (error) {
            throw new Error(`Error fetching countries: ${error.message}`);
        }
    }

    // Get featured visas
    async getFeaturedVisas(limit = 10) {
        try {
            return await Visa.find({ 
                status: 'Active', 
                isFeatured: true 
            })
                .sort('-popularityScore')
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Error fetching featured visas: ${error.message}`);
        }
    }

    // Increment application count
    async incrementApplicationCount(visaId) {
        try {
            return await Visa.findByIdAndUpdate(
                visaId,
                { $inc: { applicationCount: 1, popularityScore: 1 } },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error incrementing application count: ${error.message}`);
        }
    }

    // Helper method to build query
    _buildQuery(filters) {
        const query = {};

        if (filters.country) query['country.name'] = filters.country;
        if (filters.visaType) query.visaType = filters.visaType;
        if (filters.status) query.status = filters.status;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        if (filters.entryType) query.entryType = filters.entryType;

        return query;
    }
}

export default new VisaService();
