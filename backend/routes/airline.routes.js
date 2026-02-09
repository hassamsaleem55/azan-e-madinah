import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import {
  addAirline,
  getAirlines,
  getAirlineById,
  updateAirline,
  deleteAirline
} from "../controllers/airline.controller.js";
import {
  validateCreateAirline,
  validateUpdateAirline,
  validateId,
  validatePaginationQuery
} from "../middleware/validation.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add new airline (with logo upload)
router.post("/add", checkPermission('airlines.create'), upload.single("logo"), validateCreateAirline, addAirline);

// Get all airlines
router.get("/", checkPermission('airlines.view'), validatePaginationQuery, getAirlines);

// Get single airline by ID
router.get("/:id", checkPermission('airlines.view'), validateId, getAirlineById);

// Update airline (with optional logo upload)
router.put("/:id", checkPermission('airlines.edit'), upload.single("logo"), validateUpdateAirline, updateAirline);

// Delete airline
router.delete("/:id", checkPermission('airlines.delete'), validateId, deleteAirline);

export default router;
