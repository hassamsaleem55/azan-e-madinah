import express from "express";
import { protect } from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import {
  addSector,
  getSectors,
  getSectorById,
  updateSector,
  deleteSector
} from "../controllers/sector.controller.js";
import {
  validateCreateSector,
  validateUpdateSector,
  validateId,
  validatePaginationQuery
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.use(protect);

// Add new sector
router.post("/add", checkPermission('sectors.create'), validateCreateSector, addSector);

// Get all sectors
router.get("/", checkPermission('sectors.view'), validatePaginationQuery, getSectors);

// Get single sector by ID
router.get("/:id", checkPermission('sectors.view'), validateId, getSectorById);

// Update sector
router.put("/:id", checkPermission('sectors.edit'), validateUpdateSector, updateSector);

// Delete sector
router.delete("/:id", checkPermission('sectors.delete'), validateId, deleteSector);

export default router;
