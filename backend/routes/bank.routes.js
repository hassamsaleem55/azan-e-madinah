import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import {
  addBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank
} from "../controllers/bank.controller.js";
import {
  validateCreateBank,
  validateUpdateBank,
  validateId,
  validatePaginationQuery
} from "../middleware/validation.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add new bank (with logo upload)
router.post("/add", checkPermission('banks.create'), upload.single("logo"), validateCreateBank, addBank);

// Get all banks
router.get("/", checkPermission('banks.view'), validatePaginationQuery, getBanks);

// Get single bank by ID
router.get("/:id", checkPermission('banks.view'), validateId, getBankById);

// Update bank (with optional logo upload)
router.put("/:id", checkPermission('banks.edit'), upload.single("logo"), validateUpdateBank, updateBank);

// Delete bank
router.delete("/:id", checkPermission('banks.delete'), validateId, deleteBank);

export default router;
