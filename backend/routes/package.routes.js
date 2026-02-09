import express from 'express';
import * as packageController from '../controllers/package.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Public routes
router.get('/featured', packageController.getFeaturedPackages);
router.get('/search', packageController.searchPackages);
router.get('/city/:city', packageController.getPackagesByCity);
router.get('/slug/:slug', packageController.getPackageBySlug);
router.get('/:id', packageController.getPackageById);
router.get('/', packageController.getPackages);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    checkPermission('packages', 'create'),
    packageController.createPackage
);

router.put(
    '/:id',
    protect,
    checkPermission('packages', 'update'),
    packageController.updatePackage
);

router.delete(
    '/:id',
    protect,
    checkPermission('packages', 'delete'),
    packageController.deletePackage
);

export default router;
