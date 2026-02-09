import Content from '../models/Content.js';

/**
 * Content Service - Business logic for content management
 */

class ContentService {
    // Create or update content
    async upsertContent(pageKey, contentData, userId) {
        try {
            const existing = await Content.findOne({ pageKey });

            if (existing) {
                // Update existing
                Object.assign(existing, contentData);
                existing.updatedBy = userId;
                existing.version += 1;
                return await existing.save();
            } else {
                // Create new
                const content = new Content({
                    pageKey,
                    ...contentData,
                    createdBy: userId,
                    updatedBy: userId
                });
                return await content.save();
            }
        } catch (error) {
            throw new Error(`Error upserting content: ${error.message}`);
        }
    }

    // Get content by page key
    async getContentByPageKey(pageKey, includeUnpublished = false) {
        try {
            const query = { pageKey };
            
            if (!includeUnpublished) {
                query.status = 'Published';
            }

            const content = await Content.findOne(query);

            if (!content) {
                throw new Error('Content not found');
            }

            return content;
        } catch (error) {
            throw new Error(`Error fetching content: ${error.message}`);
        }
    }

    // Get all content pages
    async getAllContent(status = null) {
        try {
            const query = status ? { status } : {};
            
            return await Content.find(query)
                .select('pageKey title status version updatedAt')
                .sort('pageKey')
                .lean();
        } catch (error) {
            throw new Error(`Error fetching all content: ${error.message}`);
        }
    }

    // Publish content
    async publishContent(pageKey, userId) {
        try {
            const content = await Content.findOne({ pageKey });

            if (!content) {
                throw new Error('Content not found');
            }

            content.status = 'Published';
            content.publishedAt = new Date();
            content.publishedBy = userId;

            return await content.save();
        } catch (error) {
            throw new Error(`Error publishing content: ${error.message}`);
        }
    }

    // Update about us section
    async updateAboutUs(aboutUsData, userId) {
        try {
            return await this.upsertContent('ABOUT_US', {
                title: 'About Us',
                aboutUs: aboutUsData
            }, userId);
        } catch (error) {
            throw new Error(`Error updating about us: ${error.message}`);
        }
    }

    // Update statistics
    async updateStatistics(statisticsData, userId) {
        try {
            const content = await Content.findOne({ pageKey: 'HOMEPAGE' });

            if (!content) {
                return await this.upsertContent('HOMEPAGE', {
                    title: 'Homepage',
                    statistics: statisticsData
                }, userId);
            }

            content.statistics = statisticsData;
            content.updatedBy = userId;
            content.version += 1;

            return await content.save();
        } catch (error) {
            throw new Error(`Error updating statistics: ${error.message}`);
        }
    }

    // Update contact information
    async updateContact(contactData, userId) {
        try {
            return await this.upsertContent('CONTACT', {
                title: 'Contact Us',
                contact: contactData
            }, userId);
        } catch (error) {
            throw new Error(`Error updating contact: ${error.message}`);
        }
    }

    // Update services/expertise
    async updateServices(servicesData, userId) {
        try {
            const content = await Content.findOne({ pageKey: 'HOMEPAGE' });

            if (!content) {
                return await this.upsertContent('HOMEPAGE', {
                    title: 'Homepage',
                    services: servicesData
                }, userId);
            }

            content.services = servicesData;
            content.updatedBy = userId;
            content.version += 1;

            return await content.save();
        } catch (error) {
            throw new Error(`Error updating services: ${error.message}`);
        }
    }

    // Delete content
    async deleteContent(pageKey) {
        try {
            const content = await Content.findOneAndDelete({ pageKey });
            
            if (!content) {
                throw new Error('Content not found');
            }

            return content;
        } catch (error) {
            throw new Error(`Error deleting content: ${error.message}`);
        }
    }
}

export default new ContentService();
