import express from 'express';
import * as testimonialController from '../controllers/testimonial.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Public routes
router.get('/published', testimonialController.getPublishedTestimonials);
router.post('/', testimonialController.createTestimonial);

// Protected routes (Admin only)
router.get(
    '/',
    protect,
    checkPermission('testimonials', 'read'),
    testimonialController.getTestimonials
);

router.get(
    '/:id',
    protect,
    checkPermission('testimonials', 'read'),
    testimonialController.getTestimonialById
);

router.put(
    '/:id/approve',
    protect,
    checkPermission('testimonials', 'update'),
    testimonialController.approveTestimonial
);

router.put(
    '/:id/reject',
    protect,
    checkPermission('testimonials', 'update'),
    testimonialController.rejectTestimonial
);

router.put(
    '/:id/response',
    protect,
    checkPermission('testimonials', 'update'),
    testimonialController.addResponse
);

router.put(
    '/:id/toggle-featured',
    protect,
    checkPermission('testimonials', 'update'),
    testimonialController.toggleFeatured
);

router.delete(
    '/:id',
    protect,
    checkPermission('testimonials', 'delete'),
    testimonialController.deleteTestimonial
);

export default router;
