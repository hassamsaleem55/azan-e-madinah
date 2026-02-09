import express from 'express';
import * as contentController from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Public routes
router.get('/page/:pageKey', contentController.getContentByPageKey);

// Protected routes (Admin only)
router.get(
    '/',
    protect,
    checkPermission('content', 'read'),
    contentController.getAllContent
);

router.get(
    '/admin/:pageKey',
    protect,
    checkPermission('content', 'read'),
    contentController.getContentByPageKeyAdmin
);

router.post(
    '/',
    protect,
    checkPermission('content', 'create'),
    contentController.upsertContent
);

router.put(
    '/',
    protect,
    checkPermission('content', 'update'),
    contentController.upsertContent
);

router.put(
    '/:pageKey/publish',
    protect,
    checkPermission('content', 'update'),
    contentController.publishContent
);

router.put(
    '/about-us',
    protect,
    checkPermission('content', 'update'),
    contentController.updateAboutUs
);

router.put(
    '/statistics',
    protect,
    checkPermission('content', 'update'),
    contentController.updateStatistics
);

router.put(
    '/contact',
    protect,
    checkPermission('content', 'update'),
    contentController.updateContact
);

router.put(
    '/services',
    protect,
    checkPermission('content', 'update'),
    contentController.updateServices
);

router.delete(
    '/:pageKey',
    protect,
    checkPermission('content', 'delete'),
    contentController.deleteContent
);

export default router;
