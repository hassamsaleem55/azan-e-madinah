import express from "express";
import { protect, flyingZoneAuthMiddleware } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import {
  createGroupTicketing,
  getAllGroupTicketings,
  getGroupTicketingById,
  updateGroupTicketing,
  deleteGroupTicketing
} from "../controllers/groupTicketing.controller.js";
import {
  validateCreateGroupTicketing,
  validateUpdateGroupTicketing,
  validateId,
  validatePaginationQuery
} from "../middleware/validation.middleware.js";

const router = express.Router();

/* ===========================
   GROUP TICKETING ROUTES
=========================== */

router.use(protect);

router.post("/", checkPermission('groups.create'), validateCreateGroupTicketing, createGroupTicketing);

// router.get("/", getAllGroupTicketings);
router.get(
  "/",                 // your system auth
  flyingZoneAuthMiddleware,  // external API auth
  checkPermission('groups.view'),
  validatePaginationQuery,
  getAllGroupTicketings
);

router.get("/:id", checkPermission('groups.view'), validateId, getGroupTicketingById);

router.put("/:id", checkPermission('groups.edit'), validateUpdateGroupTicketing, updateGroupTicketing);

router.delete("/:id", checkPermission('groups.delete'), validateId, deleteGroupTicketing);
export default router;
