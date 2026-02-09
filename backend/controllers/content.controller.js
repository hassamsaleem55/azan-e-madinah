import contentService from '../services/content.service.js';

/**
 * Content Controller - Handle HTTP requests for content management
 */

// Get content by page key (public)
export const getContentByPageKey = async (req, res) => {
    try {
        const content = await contentService.getContentByPageKey(req.params.pageKey, false);
        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get content by page key (admin - includes unpublished)
export const getContentByPageKeyAdmin = async (req, res) => {
    try {
        const content = await contentService.getContentByPageKey(req.params.pageKey, true);
        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get all content pages
export const getAllContent = async (req, res) => {
    try {
        const { status } = req.query;
        const content = await contentService.getAllContent(status);
        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Upsert content
export const upsertContent = async (req, res) => {
    try {
        const { pageKey, ...contentData } = req.body;
        const content = await contentService.upsertContent(
            pageKey,
            contentData,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Publish content
export const publishContent = async (req, res) => {
    try {
        const content = await contentService.publishContent(
            req.params.pageKey,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Content published successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update about us
export const updateAboutUs = async (req, res) => {
    try {
        const content = await contentService.updateAboutUs(
            req.body,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'About Us updated successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update statistics
export const updateStatistics = async (req, res) => {
    try {
        const content = await contentService.updateStatistics(
            req.body.statistics,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Statistics updated successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update contact
export const updateContact = async (req, res) => {
    try {
        const content = await contentService.updateContact(
            req.body,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Contact information updated successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update services
export const updateServices = async (req, res) => {
    try {
        const content = await contentService.updateServices(
            req.body.services,
            req.user._id
        );
        res.status(200).json({
            success: true,
            message: 'Services updated successfully',
            data: content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete content
export const deleteContent = async (req, res) => {
    try {
        await contentService.deleteContent(req.params.pageKey);
        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
