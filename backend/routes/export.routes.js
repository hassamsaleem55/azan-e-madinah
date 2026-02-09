import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { exportUsersToPDF, exportUsersToExcel } from '../controllers/export.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/export/users/pdf
// @desc    Export users to PDF
// @access  Private (Admin only)
router.get('/users/pdf', protect, exportUsersToPDF);

// @route   GET /api/export/users/excel
// @desc    Export users to Excel
// @access  Private (Admin only)
router.get('/users/excel', protect, exportUsersToExcel);

export default router;
