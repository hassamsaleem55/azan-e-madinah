import express from 'express';
import * as visaController from '../controllers/visa.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// Public routes
router.get('/countries', visaController.getAllCountries);
router.get('/featured', visaController.getFeaturedVisas);
router.get('/country/:country', visaController.getVisasByCountry);
router.get('/slug/:slug', visaController.getVisaBySlug);
router.get('/:id', visaController.getVisaById);
router.get('/', visaController.getVisas);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    checkPermission('visas', 'create'),
    visaController.createVisa
);

router.put(
    '/:id',
    protect,
    checkPermission('visas', 'update'),
    visaController.updateVisa
);

router.delete(
    '/:id',
    protect,
    checkPermission('visas', 'delete'),
    visaController.deleteVisa
);

export default router;
