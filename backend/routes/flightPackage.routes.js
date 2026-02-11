import express from 'express';
import * as flightPackageController from '../controllers/flightPackage.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all flight packages (with filters)
router.get('/', 
    checkPermission('packages', 'view'),
    flightPackageController.getAllFlightPackages
);

// Get flight packages by flight ID
router.get('/by-flight/:flightId',
    checkPermission('packages', 'view'),
    flightPackageController.getFlightPackagesByFlight
);

// Get flight packages by package ID
router.get('/by-package/:packageId',
    checkPermission('packages', 'view'),
    flightPackageController.getFlightPackagesByPackage
);

// Get single flight package
router.get('/:id',
    checkPermission('packages', 'view'),
    flightPackageController.getFlightPackageById
);

// Create flight package
router.post('/',
    checkPermission('packages', 'create'),
    flightPackageController.createFlightPackage
);

// Update flight package
router.put('/:id',
    checkPermission('packages', 'update'),
    flightPackageController.updateFlightPackage
);

// Update remaining slots (for bookings)
router.patch('/:id/slots',
    checkPermission('packages', 'update'),
    flightPackageController.updateRemainingSlots
);

// Delete flight package
router.delete('/:id',
    checkPermission('packages', 'delete'),
    flightPackageController.deleteFlightPackage
);

export default router;
