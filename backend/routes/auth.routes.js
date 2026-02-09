import express from "express";
import {
   registerUser,
   loginUser,
   verifyOTP,
   googleAuthController,
   getProfile,
   getAllUsers,
   getUserById,
   updateUserStatus,
   updateUserProfile,
   deleteUser,
   changePassword,
   requestPasswordReset,
   resetPassword,
   changeUserPassword,
   sendUserCredentials
} from "../controllers/auth.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { checkPermission, checkRole } from "../middleware/permission.middleware.js";
import { uploadProfileLogo } from "../config/cloudinary.js";
import {
  validateRegister,
  validateLogin,
  validateOTP,
  validateGoogleAuth,
  validateUpdateProfile,
  validateSendOTP,
  validateResetPassword,
  validateId,
  validateUserId
} from "../middleware/validation.middleware.js";

const router = express.Router();

/* ===========================
   AUTH ROUTES
=========================== */

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/verify-otp", validateOTP, verifyOTP);
router.post("/google-auth", validateGoogleAuth, googleAuthController);

router.get("/profile", protect, getProfile);

// Update own profile (for logged-in users)
// Supports both base64 in body or file upload via multipart/form-data
router.put("/profile", protect, uploadProfileLogo.single('logo'), validateUpdateProfile, updateUserProfile);

router.get("/users", protect, checkPermission('agencies.view'), getAllUsers);
router.get("/users/:id", protect, checkPermission('agencies.details'), validateId, getUserById);

router.put("/users/:id", protect, checkPermission('agencies.edit'), uploadProfileLogo.single('logo'), validateUpdateProfile, updateUserProfile);

router.patch("/users/:id/status", protect, checkPermission('agencies.approve'), validateId, updateUserStatus);

router.delete("/users/:id", protect, checkPermission('agencies.delete'), validateId, deleteUser);

/* ===========================
   PASSWORD MANAGEMENT ROUTES
=========================== */

// Change password for logged-in user
router.post("/change-password", protect, changePassword);

// Request password reset (forgot password)
router.post("/forgot-password", validateSendOTP, requestPasswordReset);

// Reset password with token
router.post("/reset-password", validateResetPassword, resetPassword);

// Admin: Change user/agency password
router.post("/admin/change-user-password", protect, adminOnly, changeUserPassword);

// Admin: Send credentials to user
router.post("/users/:userId/send-credentials", protect, adminOnly, validateUserId, sendUserCredentials);

export default router;
