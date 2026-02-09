import express from 'express';
import * as tourController from '../controllers/tour.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Public routes
router.get('/featured', tourController.getFeaturedTours);
router.get('/country/:country', tourController.getToursByCountry);
router.get('/category/:category', tourController.getToursByCategory);
router.get('/seasonal/:seasonalCategory', tourController.getToursBySeasonalCategory);
router.get('/slug/:slug', tourController.getTourBySlug);
router.get('/:id', tourController.getTourById);
router.get('/', tourController.getTours);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    checkPermission('tours', 'create'),
    tourController.createTour
);

router.put(
    '/:id',
    protect,
    checkPermission('tours', 'update'),
    tourController.updateTour
);

router.delete(
    '/:id',
    protect,
    checkPermission('tours', 'delete'),
    tourController.deleteTour
);

export default router;
