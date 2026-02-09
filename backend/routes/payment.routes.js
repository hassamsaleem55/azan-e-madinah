import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getLedgerByUser,
  exportLedgerCSV,
  exportLedgerExcel,
  exportLedgerPDF,
} from "../controllers/payment.controller.js";
import {
  validateCreatePayment,
  validateId,
  validateUserId,
  validatePaginationQuery
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.use(protect);

// Create new payment (with receipt upload)
router.post("/add", checkPermission('payments.create'), upload.single("receipt"), validateCreatePayment, createPayment);

// Get all payments (with optional filters)
router.get("/", checkPermission('payments.view'), validatePaginationQuery, getPayments);

// Get single payment by ID
router.get("/:id", checkPermission('payments.view'), validateId, getPaymentById);

// Update payment (with optional receipt upload)
router.put("/:id", checkPermission('payments.edit'), upload.single("receipt"), validateId, updatePayment);

// Delete payment
router.delete("/:id", checkPermission('payments.delete'), validateId, deletePayment);

// Get ledger for a specific user
router.get("/ledger/:userId", checkPermission('ledger.view'), validateUserId, getLedgerByUser);

// Export ledger in different formats
router.get("/ledger/:userId/export/csv", checkPermission('reports.export'), validateUserId, exportLedgerCSV);
router.get("/ledger/:userId/export/excel", checkPermission('reports.export'), exportLedgerExcel);
router.get("/ledger/:userId/export/pdf", checkPermission('reports.export'), exportLedgerPDF);

export default router;
