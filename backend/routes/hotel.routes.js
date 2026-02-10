import express from 'express';
import * as hotelController from '../controllers/hotel.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { uploadHotelImages } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/featured', hotelController.getFeaturedHotels);
router.get('/search', hotelController.searchHotels);
router.get('/city/:city', hotelController.getHotelsByCity);
router.get('/slug/:slug', hotelController.getHotelBySlug);
router.get('/:id', hotelController.getHotelById);
router.get('/', hotelController.getHotels);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    checkPermission('hotels', 'create'),
    uploadHotelImages.array('images', 10),
    hotelController.createHotel
);

router.put(
    '/:id',
    protect,
    checkPermission('hotels', 'update'),
    uploadHotelImages.array('images', 10),
    hotelController.updateHotel
);

router.delete(
    '/:id',
    protect,
    checkPermission('hotels', 'delete'),
    hotelController.deleteHotel
);

export default router;
