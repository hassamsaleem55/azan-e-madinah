import Testimonial from '../models/Testimonial.js';

/**
 * Testimonial Service - Business logic for testimonial management
 */

class TestimonialService {
    // Create new testimonial
    async createTestimonial(testimonialData, userId) {
        try {
            const testimonial = new Testimonial({
                ...testimonialData,
                createdBy: userId
            });
            return await testimonial.save();
        } catch (error) {
            throw new Error(`Error creating testimonial: ${error.message}`);
        }
    }

    // Get all testimonials with filters
    async getTestimonials(filters = {}, page = 1, limit = 10, sort = '-createdAt') {
        try {
            const query = this._buildQuery(filters);
            const skip = (page - 1) * limit;

            const testimonials = await Testimonial.find(query)
                .populate('customer.userId', 'name email')
                .populate('reviewedBy', 'name')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Testimonial.countDocuments(query);

            return {
                testimonials,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching testimonials: ${error.message}`);
        }
    }

    // Get testimonial by ID
    async getTestimonialById(testimonialId) {
        try {
            const testimonial = await Testimonial.findById(testimonialId)
                .populate('customer.userId', 'name email')
                .populate('reviewedBy', 'name email')
                .populate('response.respondedBy', 'name');

            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            return testimonial;
        } catch (error) {
            throw new Error(`Error fetching testimonial: ${error.message}`);
        }
    }

    // Get published testimonials (for public display)
    async getPublishedTestimonials(limit = 10, serviceType = null) {
        try {
            const query = {
                status: 'Approved',
                isVerified: true
            };

            if (serviceType) {
                query.serviceType = serviceType;
            }

            return await Testimonial.find(query)
                .select('customer title content rating serviceType createdAt isFeatured')
                .sort('-isFeatured -rating -createdAt')
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Error fetching published testimonials: ${error.message}`);
        }
    }

    // Approve testimonial
    async approveTestimonial(testimonialId, userId) {
        try {
            const testimonial = await Testimonial.findByIdAndUpdate(
                testimonialId,
                {
                    status: 'Approved',
                    reviewedBy: userId,
                    reviewedAt: new Date()
                },
                { new: true }
            );

            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            return testimonial;
        } catch (error) {
            throw new Error(`Error approving testimonial: ${error.message}`);
        }
    }

    // Reject testimonial
    async rejectTestimonial(testimonialId, userId, reason) {
        try {
            const testimonial = await Testimonial.findByIdAndUpdate(
                testimonialId,
                {
                    status: 'Rejected',
                    reviewedBy: userId,
                    reviewedAt: new Date(),
                    rejectionReason: reason
                },
                { new: true }
            );

            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            return testimonial;
        } catch (error) {
            throw new Error(`Error rejecting testimonial: ${error.message}`);
        }
    }

    // Add response to testimonial
    async addResponse(testimonialId, responseContent, userId) {
        try {
            const testimonial = await Testimonial.findByIdAndUpdate(
                testimonialId,
                {
                    response: {
                        content: responseContent,
                        respondedBy: userId,
                        respondedAt: new Date()
                    }
                },
                { new: true }
            );

            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            return testimonial;
        } catch (error) {
            throw new Error(`Error adding response: ${error.message}`);
        }
    }

    // Toggle featured status
    async toggleFeatured(testimonialId) {
        try {
            const testimonial = await Testimonial.findById(testimonialId);
            
            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            testimonial.isFeatured = !testimonial.isFeatured;
            await testimonial.save();

            return testimonial;
        } catch (error) {
            throw new Error(`Error toggling featured status: ${error.message}`);
        }
    }

    // Delete testimonial
    async deleteTestimonial(testimonialId) {
        try {
            const testimonial = await Testimonial.findByIdAndDelete(testimonialId);
            
            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            return testimonial;
        } catch (error) {
            throw new Error(`Error deleting testimonial: ${error.message}`);
        }
    }

    // Helper method to build query
    _buildQuery(filters) {
        const query = {};

        if (filters.status) query.status = filters.status;
        if (filters.serviceType) query.serviceType = filters.serviceType;
        if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
        if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
        if (filters.rating) query.rating = filters.rating;

        return query;
    }
}

export default new TestimonialService();
