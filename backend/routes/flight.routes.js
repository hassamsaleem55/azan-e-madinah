import express from 'express';
import {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight
} from '../controllers/flight.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Flight routes
router.post('/', createFlight);
router.get('/', getAllFlights);
router.get('/:id', getFlightById);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

export default router;
