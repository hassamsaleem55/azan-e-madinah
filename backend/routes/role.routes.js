import express from "express";
import * as roleController from "../controllers/role.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkRole, checkPermission } from "../middleware/permission.middleware.js";
import {
  validateCreateRole,
  validateUpdateRole,
  validateId
} from "../middleware/validation.middleware.js";

const router = express.Router();

// Role routes
router.get("/roles", protect, checkPermission('settings.roles'), roleController.getAllRoles);
router.get("/roles/:id", protect, checkPermission('settings.roles'), validateId, roleController.getRole);
router.post("/roles", protect, checkPermission('settings.roles'), validateCreateRole, roleController.createRole);
router.put("/roles/:id", protect, checkPermission('settings.roles'), validateUpdateRole, roleController.updateRole);
router.delete("/roles/:id", protect, checkPermission('settings.roles'), validateId, roleController.deleteRole);
router.put("/roles/:id/permissions", protect, checkPermission('settings.roles'), validateId, roleController.assignPermissions);

// Permission routes
router.get("/permissions", protect, checkPermission('settings.permissions'), roleController.getAllPermissions);
router.post("/permissions", protect, checkPermission('settings.permissions'), roleController.createPermission);
router.put("/permissions/:id", protect, checkPermission('settings.permissions'), validateId, roleController.updatePermission);
router.delete("/permissions/:id", protect, checkPermission('settings.permissions'), validateId, roleController.deletePermission);

export default router;
