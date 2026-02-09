import Register from "../models/Register.js";
import Role from "../models/Role.js";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import {
  sendPasswordResetEmail,
  sendAgentPasswordResetEmail,
  sendAdminPasswordResetEmail,
  sendCredentialsEmail,
  sendAgentCredentialsEmail,
  sendAdminCredentialsEmail,
  sendAgentApprovalEmail,
  sendAgentStatusChangeEmail,
  sendPasswordChangeNotification,
  sendOTPEmail,
  sendInternalStaffAccessNotification,
  sendAgentPortalAccessNotification
} from "../utils/emailService.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ===========================
   GENERATE JWT
   - Includes user roles for authorization
   - Portal context can be added if needed
=========================== */
const generateToken = (userId, roles = []) => {
  const roleNames = roles.map(r => typeof r === 'object' ? r.name : r);
  return jwt.sign({
    id: userId,
    roles: roleNames
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

/* ===========================
   REGISTER USER
   - Supports both agent_portal (public registration) and admin_portal (admin creating users)
   - Agent portal: Only allows Agent role registration
   - Admin portal: Allows any role assignment
=========================== */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, role, companyName, address = "", city = "", registrationFrom } = req.body;

    // Import Role model
    const Role = (await import('../models/Role.js')).default;

    // Determine requested roles
    const rolesInput = Array.isArray(role) ? role : (role ? [role] : []);
    let roleIds = [];

    // If roles provided, process them
    if (rolesInput.length > 0) {
      for (const r of rolesInput) {
        if (mongoose.Types.ObjectId.isValid(r)) {
          roleIds.push(r);
        }
      }
    }

    // Get Agent role reference
    const agentRole = await Role.findOne({ name: 'Agent' });

    // CRITICAL: Enforce identity separation rules
    if (registrationFrom === "agent-portal") {
      // Agent Portal: ONLY Agent role allowed through self-registration
      // This is the ONLY way to obtain Agent identity
      if (roleIds.length > 0) {
        const hasNonAgentRole = roleIds.some(rid => rid.toString() !== agentRole?._id.toString());
        if (hasNonAgentRole) {
          return res.status(403).json({
            success: false,
            message: "Agent Portal registration is only for travel agents. Internal staff roles cannot be obtained through public registration."
          });
        }
      }
      // Force Agent role only
      roleIds = agentRole ? [agentRole._id] : [];

    } else if (registrationFrom === "admin_portal") {
      // Admin Portal: ONLY Internal Staff roles allowed (NO Agent role)
      // Agent identity can NEVER be assigned from admin panel
      if (roleIds.some(rid => rid.toString() === agentRole?._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Agent role cannot be assigned from Admin Panel. Agents must self-register through the Agent Portal."
        });
      }

      // Validate all roles are internal staff roles (not Agent)
      if (roleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one internal staff role must be specified when creating users from Admin Panel."
        });
      }

    } else {
      // No portal specified: Default behavior (legacy)
      if (roleIds.length === 0 && agentRole) {
        roleIds = [agentRole._id];
      }
    }

    // Check if user with this email already exists
    const existingUser = await Register.findOne({ email }).populate('roles');

    if (existingUser) {
      // User exists - Determine if adding Agent identity or Internal Staff identity
      if (roleIds.length > 0) {
        // Check if any of the requested roles are already assigned
        const existingRoleIds = existingUser.roles.map(r => r._id.toString());
        const newRoleIds = roleIds.filter(rid => !existingRoleIds.includes(rid.toString()));

        if (newRoleIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: registrationFrom === "agent-portal" ? "User already registered with this email" : "User already has the specified role(s)"
          });
        }

        // Determine what identity is being added
        const agentRole = await Role.findOne({ name: 'Agent' });
        const isAddingAgentIdentity = newRoleIds.some(rid => rid.toString() === agentRole?._id.toString());
        const isAddingInternalIdentity = newRoleIds.some(rid => rid.toString() !== agentRole?._id.toString());
        const userHadAgentRole = existingUser.roles.some(r => r._id.toString() === agentRole?._id.toString());
        const userHadInternalRoles = existingUser.roles.some(r => r._id.toString() !== agentRole?._id.toString());

        // AGENT IDENTITY ONBOARDING (First time getting agent identity)
        if (isAddingAgentIdentity && !userHadAgentRole) {
          // This is a NEW AGENT IDENTITY for an existing internal staff user
          // Treat as complete agent onboarding

          // Generate agency code
          if (!existingUser.agencyCode) {
            const lastAgency = await Register.find({ agencyCode: { $exists: true, $ne: null } })
              .sort({ agencyCode: -1 })
              .limit(1);

            const lastCode = lastAgency[0]?.agencyCode || "0000";
            const nextCodeNum = parseInt(lastCode, 10) + 1;
            existingUser.agencyCode = nextCodeNum.toString().padStart(4, "0");
          }

          // Set agent status to Inactive (requires approval)
          existingUser.agentStatus = "Inactive";

          // Add Agent role (keep existing password for seamless access)
          existingUser.roles.push(agentRole._id);
          await existingUser.save();

          // Send notification about Agent identity (no password change)
          try {
            await sendAgentPortalAccessNotification(
              existingUser.email,
              existingUser.name,
              existingUser.companyName || existingUser.name,
              existingUser.agencyCode
            );
            console.log(`✅ Agent identity added (role only, password unchanged): ${existingUser.email} - Agency: ${existingUser.agencyCode}`);
          } catch (emailError) {
            console.error(`Failed to send agent portal access notification:`, emailError.message);
          }

          const updatedUser = await Register.findById(existingUser._id)
            .populate({
              path: 'roles',
              populate: { path: 'permissions' }
            });

          return res.status(200).json({
            success: true,
            message: "Agent identity added successfully! Your existing password still works. Agent portal access is now enabled.",
            identityAdded: "Agent",
            token: generateToken(existingUser._id, updatedUser.roles),
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              roles: updatedUser.roles || [],
              role: updatedUser.roles?.[0],
              agencyCode: updatedUser.agencyCode,
              agentStatus: updatedUser.agentStatus,
              permissions: updatedUser.roles?.flatMap(r => r.permissions || []) || []
            }
          });
        }

        // INTERNAL STAFF IDENTITY ONBOARDING (First time getting internal roles)
        if (isAddingInternalIdentity && !userHadInternalRoles) {
          // This is a NEW INTERNAL STAFF IDENTITY for an existing agent
          // Keep existing password for seamless access to both portals

          // Set general status to Active for internal staff
          existingUser.status = "Active";

          // Add internal staff roles
          existingUser.roles.push(...newRoleIds);
          await existingUser.save();

          // Send notification about new internal staff identity (no password change)
          try {
            const updatedUser = await Register.findById(existingUser._id).populate('roles');
            const internalRoleNames = updatedUser.roles
              .filter(r => r.name !== 'Agent')
              .map(r => r.name);

            // Send email notification about Admin Panel access
            await sendInternalStaffAccessNotification(
              existingUser.email,
              existingUser.name,
              internalRoleNames
            );
            console.log(`✅ Internal staff roles added for: ${existingUser.email} - Roles: ${internalRoleNames.join(', ')} (password unchanged, email sent)`);
          } catch (emailError) {
            console.error(`Failed to send internal staff notification:`, emailError.message);
          }

          const updatedUser = await Register.findById(existingUser._id)
            .populate({
              path: 'roles',
              populate: { path: 'permissions' }
            });

          return res.status(200).json({
            success: true,
            message: "Internal staff identity added successfully! Your existing password still works for admin panel access.",
            identityAdded: "Internal Staff",
            token: generateToken(existingUser._id, updatedUser.roles),
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              roles: updatedUser.roles || [],
              role: updatedUser.roles?.[0],
              status: updatedUser.status,
              permissions: updatedUser.roles?.flatMap(r => r.permissions || []) || []
            }
          });
        }

        // Adding additional roles to existing identity (not first time)
        existingUser.roles.push(...newRoleIds);
        await existingUser.save();

        const updatedUser = await Register.findById(existingUser._id)
          .populate({
            path: 'roles',
            populate: { path: 'permissions' }
          });

        return res.status(200).json({
          success: true,
          message: "Additional role(s) added successfully. No credential changes - use your existing password.",
          token: generateToken(existingUser._id, updatedUser.roles),
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            roles: updatedUser.roles || [],
            role: updatedUser.roles?.[0],
            agencyCode: updatedUser.agencyCode,
            permissions: updatedUser.roles?.flatMap(r => r.permissions || []) || []
          }
        });
      }

      // If no roles specified and user exists, just ensure Agent role
      const agentRole = await Role.findOne({ name: 'Agent' });
      const hasAgentRole = existingUser.roles.some(r => r._id.toString() === agentRole._id.toString());

      if (!hasAgentRole) {
        existingUser.roles.push(agentRole._id);
        await existingUser.save();
      }

      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // User doesn't exist - create new user
    // Always auto-generate password for security and consistency
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + "A1!";
    const plainPassword = generatedPassword;

    // Check if user will have Agent role to determine status and agency code
    // agentRole already declared above, reuse it
    const hasAgentRole = roleIds.some(rid => rid.toString() === agentRole?._id.toString());

    // Set default status - general status Active by default
    const status = "Active";

    // Set agent status - Inactive by default when agent role assigned, requires admin activation
    const agentStatus = hasAgentRole ? "Inactive" : "Pending";

    // Generate sequential 4-digit agency code if Agent role
    let agencyCode = null;
    if (hasAgentRole) {
      const lastAgency = await Register.find({ agencyCode: { $exists: true } })
        .sort({ agencyCode: -1 })
        .limit(1);
      const lastCode = lastAgency[0]?.agencyCode || "0000";
      const nextCodeNum = parseInt(lastCode, 10) + 1;
      agencyCode = nextCodeNum.toString().padStart(4, "0");
    }

    const user = await Register.create({
      name,
      email,
      phone,
      password: generatedPassword,
      plainPassword,
      isAutoGeneratedPassword: true,
      roles: roleIds,
      companyName,
      address,
      city,
      agencyCode,
      status,
      agentStatus
    });

    // Populate roles for response
    const populatedUser = await Register.findById(user._id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });

    // Send credentials email to new user (agent or admin)
    try {
      // Get role names for email
      const roleNames = populatedUser.roles?.map(r => r.name) || [];
      const hasAgentIdentity = roleNames.includes('Agent');
      const hasInternalIdentity = roleNames.some(r => r !== 'Agent');

      if (hasAgentIdentity && !hasInternalIdentity) {
        // Pure AGENT IDENTITY onboarding
        await sendAgentCredentialsEmail(
          user.email,
          user.agencyCode,
          plainPassword,
          user.name,
          user.companyName || user.name
        );
        console.log(`✅ Agent identity credentials email sent to: ${user.email}`);
      } else if (hasInternalIdentity && !hasAgentIdentity) {
        // Pure INTERNAL STAFF IDENTITY onboarding
        const internalRoleNames = roleNames.filter(r => r !== 'Agent');
        await sendAdminCredentialsEmail(
          user.email,
          plainPassword,
          user.name,
          internalRoleNames
        );
        console.log(`✅ Internal staff credentials email sent to: ${user.email}`);
      } else {
        // Hybrid case (shouldn't happen with new rules, but handle gracefully)
        await sendCredentialsEmail(
          user.email,
          plainPassword,
          user.name,
          {
            agentCode: user.agencyCode,
            companyName: user.companyName,
            roles: roleNames
          }
        );
        console.log(`✅ Credentials email sent to: ${user.email}`);
      }
    } catch (emailError) {
      console.error(`❌ Failed to send credentials email to ${user.email}:`, emailError.message);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: hasAgentRole
        ? "Agent account created successfully! Check your email for credentials and onboarding instructions."
        : "Internal staff account created successfully! Check your email for credentials and setup instructions.",
      identity: hasAgentRole ? "Agent" : "Internal Staff",
      token: generateToken(user._id, populatedUser.roles),
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        roles: populatedUser.roles || [],
        role: populatedUser.roles?.[0],
        agencyCode: populatedUser.agencyCode,
        permissions: populatedUser.roles?.flatMap(r => r.permissions || []) || []
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   LOGIN USER - STEP 1: SEND OTP
=========================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password, agencyCode, loginFrom } = req.body;

    const user = await Register.findOne({ email })
      .select("+password")
      .populate('roles');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user has Agent role
    const hasAgentRole = user.roles?.some(r => r.name === 'Agent');
    const hasOtherRoles = user.roles?.some(r => r.name !== 'Agent');

    // Frontend login (agent) - only allow users with Agent role
    if (loginFrom === "agent-portal") {
      if (!hasAgentRole) {
        // User doesn't have Agent role, cannot access agent portal
        const userRoles = user.roles?.map(r => r.name).join(', ') || 'No roles';
        console.log(`🚫 Agent portal access denied for ${user.email} - Roles: ${userRoles}`);

        return res.status(403).json({
          success: false,
          message: hasOtherRoles
            ? "Access denied. You need an Agent role to access the agent portal. Please contact administrator to add Agent role to your account, or use the admin panel."
            : "Access denied. This login is for agents only. Please register as an agent or contact administrator."
        });
      }

      // Verify agency code for Agent role
      const storedCode = user.agencyCode?.toLowerCase().trim();
      const incomingCode = agencyCode?.toLowerCase().trim();
      if (!incomingCode || !storedCode || storedCode !== incomingCode) {
        return res.status(401).json({
          success: false,
          message: "Invalid agent code. Please check your agency code and try again.",
          agentStatus: user.agentStatus
        });
      }

      // Check agent status (separate from general status)
      if (user.agentStatus !== "Active") {
        const msg =
          user.agentStatus === "Suspended"
            ? "Your agent account is suspended. Please contact admin."
            : user.agentStatus === "Inactive"
              ? "Your agent account is inactive. Please wait for admin approval."
              : "Your agent account is pending approval. Please wait for admin activation.";

        return res.status(403).json({
          success: false,
          message: msg,
          agentStatus: user.agentStatus
        });
      }
    }

    // Admin panel login - only allow users with non-Agent roles
    if (loginFrom === "admin_portal") {
      if (hasAgentRole && !hasOtherRoles) {
        // User only has Agent role, cannot access admin portal
        console.log(`🚫 Admin portal access denied for ${user.email} - Only has Agent role`);

        return res.status(403).json({
          success: false,
          message: "Access denied. Agent accounts cannot login to admin panel. Please use the agent portal at the main website."
        });
      }

      if (!hasOtherRoles) {
        console.log(`🚫 Admin portal access denied for ${user.email} - No admin roles`);

        return res.status(403).json({
          success: false,
          message: "Access denied. You don't have permission to access the admin panel. Please contact administrator."
        });
      }

      // Check general user status for admin portal (not agent status)
      if (user.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: user.status === "Suspended"
            ? "Your account is suspended. Please contact administrator."
            : "Your account is inactive. Please contact administrator."
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to portal-specific fields
    if (loginFrom === 'agent-portal') {
      user.agentOTP = otp;
      user.agentOTPExpiry = otpExpiry;
    } else if (loginFrom === 'admin_portal') {
      user.adminOTP = otp;
      user.adminOTPExpiry = otpExpiry;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid portal context. Please specify loginFrom parameter."
      });
    }
    await user.save();

    // Send OTP via email with portal type
    // Use companyName for agent portal, name for admin panel
    const displayName = loginFrom === 'agent-portal' ? (user.companyName || user.name) : user.name;

    try {
      await sendOTPEmail(user.email, otp, displayName, loginFrom);
    } catch (emailError) {
      console.error(`Failed to send OTP email:`, emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again."
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
      requiresOTP: true,
      email: user.email
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   VERIFY OTP - STEP 2: COMPLETE LOGIN
=========================== */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, loginFrom } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find user with OTP - select appropriate OTP fields based on portal
    if (!loginFrom || (loginFrom !== 'agent-portal' && loginFrom !== 'admin_portal')) {
      return res.status(400).json({
        success: false,
        message: "Invalid portal context. Please specify loginFrom parameter."
      });
    }

    const selectFields = loginFrom === 'agent-portal'
      ? '+agentOTP +agentOTPExpiry'
      : '+adminOTP +adminOTPExpiry';

    const user = await Register.findOne({ email })
      .select(selectFields)
      .populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get the appropriate OTP and expiry based on portal
    let userOTP, userOTPExpiry, portalName;
    if (loginFrom === 'agent-portal') {
      userOTP = user.agentOTP;
      userOTPExpiry = user.agentOTPExpiry;
      portalName = 'Agent Portal';
    } else {
      userOTP = user.adminOTP;
      userOTPExpiry = user.adminOTPExpiry;
      portalName = 'Admin Panel';
    }

    // Check if OTP exists
    if (!userOTP || !userOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: `No OTP found for ${portalName}. Please request a new one.`
      });
    }

    // Check if OTP has expired
    if (new Date() > userOTPExpiry) {
      // Clear expired OTP for this portal
      if (loginFrom === 'agent-portal') {
        user.agentOTP = undefined;
        user.agentOTPExpiry = undefined;
      } else {
        user.adminOTP = undefined;
        user.adminOTPExpiry = undefined;
      }
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Verify OTP
    if (userOTP !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    // OTP verified successfully - clear OTP for this portal only
    if (loginFrom === 'agent-portal') {
      user.agentOTP = undefined;
      user.agentOTPExpiry = undefined;
    } else {
      user.adminOTP = undefined;
      user.adminOTPExpiry = undefined;
    }
    user.lastLogin = new Date();
    await user.save();

    // Populate roles and permissions
    const populatedUser = await Register.findById(user._id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      })
      .select('-password -plainPassword');

    // Aggregate all permissions
    const allPermissions = populatedUser.roles?.flatMap(r => r.permissions || []) || [];
    const uniquePermissions = Array.from(
      new Map(allPermissions.map(p => [p._id.toString(), p])).values()
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id, populatedUser.roles),
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        roles: populatedUser.roles || [],
        role: populatedUser.roles?.[0],
        status: populatedUser.status,
        agentStatus: populatedUser.agentStatus,
        agencyCode: populatedUser.agencyCode,
        logo: populatedUser.logo,
        permissions: uniquePermissions
      }
    });
  } catch (error) {
    console.error("OTP VERIFICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GOOGLE AUTHENTICATION
   - Handles both login and registration via Google OAuth
   - Follows same user uniqueness logic as regular auth
   - Assigns Agent role by default for new users
   - Supports all registration fields
   - Returns consistent response format
   - Implements role-based access control for agent_portal and admin_portal
=========================== */
export const googleAuthController = async (req, res) => {
  const { credential, phone, companyName, address, city, role, loginFrom } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Missing credential"
    });
  }

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by Google"
      });
    }

    // Import Role model
    const Role = (await import('../models/Role.js')).default;
    const agentRole = await Role.findOne({ name: 'Agent' });

    // Determine requested roles based on portal and input
    // IDENTITY SEPARATION RULE: Portal determines which identity/roles can be assigned
    const rolesInput = Array.isArray(role) ? role : (role ? [role] : []);
    let roleIds = [];

    // Process role inputs if provided
    if (rolesInput.length > 0) {
      for (const r of rolesInput) {
        if (mongoose.Types.ObjectId.isValid(r)) {
          roleIds.push(r);
        }
      }
    }

    // ENFORCE IDENTITY SEPARATION BASED ON PORTAL
    if (loginFrom === "agent-portal") {
      // Agent Portal: ONLY Agent role allowed
      if (roleIds.length > 0 && roleIds.some(rid => rid.toString() !== agentRole?._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Agent Portal registration is only for travel agents. Only Agent role can be assigned through this portal."
        });
      }
      // Force Agent role for agent portal
      roleIds = agentRole ? [agentRole._id] : [];

    } else if (loginFrom === "admin_portal") {
      // Admin Panel: BLOCKS Agent role completely
      if (roleIds.some(rid => rid.toString() === agentRole?._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Agent role cannot be assigned from Admin Panel. Agents must register through the Agent Portal on the main website."
        });
      }
      // If no roles specified for admin panel, throw error (admin should specify roles)
      if (roleIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Internal staff registration requires role selection. Please select appropriate role(s)."
        });
      }

    } else {
      // Legacy/No portal specified: Default to Agent role for backward compatibility
      if (roleIds.length === 0) {
        roleIds = agentRole ? [agentRole._id] : [];
      }
    }

    // Check if user exists
    let user = await Register.findOne({ email }).populate('roles');
    let isNewUser = false;

    if (user) {
      // Existing user - check if we're adding a NEW IDENTITY
      if (roleIds.length > 0) {
        const existingRoleIds = user.roles.map(r => r._id.toString());
        const newRoleIds = roleIds.filter(rid => !existingRoleIds.includes(rid.toString()));

        if (newRoleIds.length > 0) {
          // Check if Agent role is being added for the first time
          const agentRole = await Role.findOne({ name: 'Agent' });
          const isAddingAgentRole = newRoleIds.some(rid => rid.toString() === agentRole?._id.toString());
          const userHadAgentRole = user.roles.some(r => r._id.toString() === agentRole?._id.toString());

          // Generate agency code if Agent role is being added and user doesn't have one
          if (isAddingAgentRole && !userHadAgentRole && !user.agencyCode) {
            const lastAgency = await Register.find({ agencyCode: { $exists: true, $ne: null } })
              .sort({ agencyCode: -1 })
              .limit(1);

            const lastCode = lastAgency[0]?.agencyCode || "0000";
            const nextCodeNum = parseInt(lastCode, 10) + 1;
            user.agencyCode = nextCodeNum.toString().padStart(4, "0");

            // Set agent status to Inactive when agent role first assigned
            user.agentStatus = "Inactive";

            console.log(`✅ Assigned agency code ${user.agencyCode} to existing user: ${email}`);
          }

          // Add new roles to existing user
          user.roles.push(...newRoleIds);

          // Update profile fields if provided
          if (phone) user.phone = phone;
          if (companyName) user.companyName = companyName;
          if (address) user.address = address;
          if (city) user.city = city;
          if (picture && !user.logo) user.logo = picture;
          if (!user.isGoogleAccount) user.isGoogleAccount = true;

          await user.save();

          // Populate and return updated user
          const updatedUser = await Register.findById(user._id)
            .populate({
              path: 'roles',
              populate: { path: 'permissions' }
            });

          // Send email notification for role assignment
          try {
            const roleNames = updatedUser.roles?.map(r => r.name) || [];
            const newRoleNames = newRoleIds.map(rid => {
              const foundRole = updatedUser.roles?.find(r => r._id.toString() === rid.toString());
              return foundRole ? foundRole.name : '';
            }).filter(Boolean);

            console.log(`📧 Sending role assignment email to: ${user.email} for roles: ${newRoleNames.join(', ')}`);

            // If agent role was added, send agent credentials
            if (isAddingAgentRole && user.agencyCode) {
              await sendAgentCredentialsEmail(
                user.email,
                user.agencyCode,
                user.plainPassword || 'Please use Google Sign-In',
                user.name,
                user.companyName || 'N/A'
              );
            } else {
              // Send admin credentials for non-agent roles
              await sendAdminCredentialsEmail(
                user.email,
                user.plainPassword || 'Please use Google Sign-In',
                user.name,
                newRoleNames
              );
            }
            console.log(`✅ Role assignment email sent to: ${user.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send role assignment email to ${user.email}:`, emailError.message);
            // Don't fail the operation if email fails
          }

          // Check if user has Agent role and validate agentStatus for agent portal
          const updatedHasAgentRole = updatedUser.roles?.some(r => r.name === 'Agent');
          const updatedHasOtherRoles = updatedUser.roles?.some(r => r.name !== 'Agent');

          // Apply portal-based access control
          if (loginFrom === "agent-portal") {
            if (!updatedHasAgentRole) {
              return res.status(403).json({
                success: false,
                message: "Access denied. This login is for agents only. Please use the admin panel."
              });
            }

            // Check agent status for agent portal
            if (updatedUser.agentStatus !== "Active") {
              const msg =
                updatedUser.agentStatus === "Suspended"
                  ? "Your agent account is suspended. Please contact admin."
                  : updatedUser.agentStatus === "Inactive"
                    ? "Your agent account is inactive. Please wait for admin approval."
                    : "Your agent account is pending approval. Please wait for admin activation.";

              return res.status(403).json({
                success: false,
                message: isAddingAgentRole
                  ? "Agent role added successfully. Please wait for admin approval to access the agent portal."
                  : msg,
                agentStatus: updatedUser.agentStatus
              });
            }
          }

          // Admin panel access control
          if (loginFrom === "admin_portal") {
            if (updatedHasAgentRole && !updatedHasOtherRoles) {
              return res.status(403).json({
                success: false,
                message: "Access denied. Agent accounts cannot login to admin panel. Please use the main website."
              });
            }

            if (!updatedHasOtherRoles) {
              return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission to access the admin panel."
              });
            }

            // Check general user status for admin portal
            if (updatedUser.status !== "Active") {
              return res.status(403).json({
                success: false,
                message: updatedUser.status === "Suspended"
                  ? "Your account is suspended. Please contact administrator."
                  : "Your account is inactive. Please contact administrator."
              });
            }
          }

          // Aggregate all permissions
          const allPermissions = updatedUser.roles?.flatMap(r => r.permissions || []) || [];
          const uniquePermissions = Array.from(
            new Map(allPermissions.map(p => [p._id.toString(), p])).values()
          );

          return res.status(200).json({
            success: true,
            message: "Role(s) added to existing user successfully",
            token: generateToken(user._id, updatedUser.roles),
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              roles: updatedUser.roles || [],
              role: updatedUser.roles?.[0],
              status: updatedUser.status,
              agencyCode: updatedUser.agencyCode,
              logo: updatedUser.logo,
              isGoogleAccount: true,
              permissions: uniquePermissions
            }
          });
        }
      }

      // Existing user - update last login and profile fields
      const isFirstLogin = !user.lastLogin;
      user.lastLogin = new Date();
      if (phone && !user.phone) user.phone = phone;
      if (companyName && !user.companyName) user.companyName = companyName;
      if (address && !user.address) user.address = address;
      if (city && !user.city) user.city = city;
      if (picture && !user.logo) user.logo = picture;
      if (!user.isGoogleAccount) user.isGoogleAccount = true;
      await user.save();

      // Send welcome email on first login if user was created via OAuth
      if (isFirstLogin && user.isGoogleAccount) {
        try {
          const roleNames = user.roles?.map(r => r.name) || [];
          console.log(`📧 Sending first login welcome email to: ${user.email}`);

          if (user.agencyCode) {
            await sendAgentCredentialsEmail(
              user.email,
              user.agencyCode,
              'Please use Google Sign-In',
              user.name,
              user.companyName || 'N/A'
            );
          } else {
            await sendAdminCredentialsEmail(
              user.email,
              'Please use Google Sign-In',
              user.name,
              roleNames
            );
          }
          console.log(`✅ First login welcome email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send welcome email to ${user.email}:`, emailError.message);
          // Don't fail the login if email fails
        }
      }

      // Ensure user has at least Agent role
      if (!user.roles || user.roles.length === 0) {
        const agentRole = await Role.findOne({ name: 'Agent' });
        if (agentRole) {
          user.roles = [agentRole._id];
          await user.save();
          console.log(`✅ Assigned Agent role to existing Google user: ${email}`);
        }
      }
    } else {
      // New user - create account with identity-specific setup
      isNewUser = true;

      if (roleIds.length === 0) {
        return res.status(500).json({
          success: false,
          message: "System error: No roles could be assigned. Please contact administrator."
        });
      }

      // Determine which identity is being created
      const hasAgentRole = roleIds.some(rid => rid.toString() === agentRole?._id.toString());
      const hasInternalRoles = roleIds.some(rid => rid.toString() !== agentRole?._id.toString());

      // Generate agency code ONLY if Agent role
      let agencyCode = null;
      if (hasAgentRole) {
        const lastAgency = await Register.find({ agencyCode: { $exists: true, $ne: null } })
          .sort({ agencyCode: -1 })
          .limit(1);

        const lastCode = lastAgency[0]?.agencyCode || "0000";
        const nextCodeNum = parseInt(lastCode, 10) + 1;
        agencyCode = nextCodeNum.toString().padStart(4, "0");
      }

      // Set identity-specific status
      // Agent identity: agentStatus = "Inactive" (requires admin approval)
      // Internal identity: status = "Active" (immediate access after OTP)
      const agentStatus = hasAgentRole ? "Inactive" : undefined;
      const status = hasInternalRoles ? "Active" : "Inactive";

      // Generate secure random password (user won't need it since they use Google)
      const randomPassword = Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10) +
        "Aa1!";

      // Create new user
      user = await Register.create({
        name,
        email,
        phone: phone || "",
        password: randomPassword,
        plainPassword: randomPassword,
        isAutoGeneratedPassword: true,
        roles: roleIds,
        companyName: companyName || "",
        address: address || "",
        city: city || "",
        isGoogleAccount: true,
        status,
        agentStatus,
        agencyCode,
        logo: picture || ""
      });

      console.log(`✅ New Google user registered via ${loginFrom || 'OAuth'}: ${email} (Agency Code: ${agencyCode || 'N/A'})`);

      // Send identity-specific credentials email
      try {
        if (hasAgentRole && agencyCode) {
          // Agent identity onboarding
          await sendAgentCredentialsEmail(
            user.email,
            agencyCode,
            'Please use Google Sign-In',
            user.name,
            user.companyName || 'Your Agency'
          );
          console.log(`✅ OAuth Agent registration - Credentials email sent to: ${user.email}`);
        } else if (hasInternalRoles) {
          // Internal staff identity onboarding
          const roleNames = await Role.find({ _id: { $in: roleIds } }).select('name');
          const roleNamesList = roleNames.map(r => r.name).join(', ');

          await sendAdminCredentialsEmail(
            user.email,
            user.email, // Internal staff use email for login
            'Please use Google Sign-In',
            user.name,
            roleNamesList
          );
          console.log(`✅ OAuth Internal Staff registration - Credentials email sent to: ${user.email}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send credentials email to ${user.email}:`, emailError.message);
        // Don't fail the registration if email fails
      }
    }

    // Populate roles and permissions
    const populatedUser = await Register.findById(user._id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      })
      .select('-password -plainPassword');

    // Check if user has Agent role
    const hasAgentRole = populatedUser.roles?.some(r => r.name === 'Agent');
    const hasOtherRoles = populatedUser.roles?.some(r => r.name !== 'Agent');

    // Apply role-based access control based on loginFrom parameter
    if (loginFrom === "agent-portal") {
      if (!hasAgentRole) {
        const userRoles = populatedUser.roles?.map(r => r.name).join(', ') || 'No roles';
        console.log(`🚫 Google Auth - Agent portal access denied for ${populatedUser.email} - Roles: ${userRoles}`);

        return res.status(403).json({
          success: false,
          message: hasOtherRoles
            ? "Access denied. You need an Agent role to access the agent portal. Please contact administrator to add Agent role to your account, or use the admin panel."
            : "Access denied. This login is for agents only. Please register as an agent or contact administrator."
        });
      }

      // Check agent status for agent portal (separate from general status)
      if (populatedUser.agentStatus !== "Active") {
        const msg =
          populatedUser.agentStatus === "Suspended"
            ? "Your agent account is suspended. Please contact admin."
            : populatedUser.agentStatus === "Inactive"
              ? "Your agent account is inactive. Please wait for admin approval."
              : "Your agent account is pending approval. Please wait for admin activation.";

        return res.status(403).json({
          success: false,
          message: isNewUser
            ? "Account created successfully. Please wait for admin approval to access the system."
            : msg,
          agentStatus: populatedUser.agentStatus
        });
      }
    }

    // Admin panel login - only allow users with non-Agent roles
    if (loginFrom === "admin_portal") {
      if (hasAgentRole && !hasOtherRoles) {
        console.log(`🚫 Google Auth - Admin portal access denied for ${populatedUser.email} - Only has Agent role`);

        return res.status(403).json({
          success: false,
          message: "Access denied. Agent accounts cannot login to admin panel. Please use the agent portal at the main website."
        });
      }

      if (!hasOtherRoles) {
        console.log(`🚫 Google Auth - Admin portal access denied for ${populatedUser.email} - No admin roles`);

        return res.status(403).json({
          success: false,
          message: "Access denied. You don't have permission to access the admin panel. Please contact administrator."
        });
      }

      // Check general user status for admin portal (not agent status)
      if (populatedUser.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: isNewUser
            ? "Account created successfully. Please wait for admin approval to access the system."
            : populatedUser.status === "Suspended"
              ? "Your account is suspended. Please contact administrator."
              : "Your account is inactive. Please contact administrator."
        });
      }
    }

    // Check if user is active (for no specific portal - backward compatibility)
    if (!loginFrom) {
      if (hasAgentRole && populatedUser.agentStatus !== 'Active') {
        return res.status(403).json({
          success: false,
          message: isNewUser
            ? "Account created successfully. Please wait for admin approval to access the system."
            : "Your agent account is inactive. Please contact administrator."
        });
      }
      if (populatedUser.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: isNewUser
            ? "Account created successfully. Please wait for admin approval to access the system."
            : "Your account is inactive. Please contact administrator."
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to portal-specific fields (Google Auth)
    if (loginFrom === 'agent-portal') {
      populatedUser.agentOTP = otp;
      populatedUser.agentOTPExpiry = otpExpiry;
    } else if (loginFrom === 'admin_portal') {
      populatedUser.adminOTP = otp;
      populatedUser.adminOTPExpiry = otpExpiry;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid portal context. Please specify loginFrom parameter."
      });
    }
    await populatedUser.save();

    // Send OTP via email with portal type
    // Use companyName for agent portal, name for admin panel
    const displayName = loginFrom === 'agent-portal' ? (populatedUser.companyName || populatedUser.name) : populatedUser.name;

    try {
      await sendOTPEmail(populatedUser.email, otp, displayName, loginFrom);
    } catch (emailError) {
      console.error(`Failed to send OTP email:`, emailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again."
      });
    }

    res.json({
      success: true,
      message: isNewUser
        ? "Account created successfully. OTP sent to your email."
        : "OTP sent to your email. Please verify to complete login.",
      requiresOTP: true,
      email: populatedUser.email,
      isNewUser
    });

  } catch (err) {
    console.error("❌ Google auth error:", err);

    // Provide more specific error messages
    if (err.message?.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: "Google token expired. Please try signing in again."
      });
    }

    if (err.message?.includes('Invalid token')) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credentials. Please try again."
      });
    }

    res.status(400).json({
      success: false,
      message: "Google authentication failed. Please try again."
    });
  }
};

/* ===========================
   GET LOGGED-IN PROFILE
=========================== */
export const getProfile = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        address: user.address,
        city: user.city,
        country: user.country,
        consultant: user.consultant,
        logo: user.logo,
        roles: user.roles,
        role: user.roles?.[0],
        status: user.status,
        creditAmount: user.creditAmount,
        permissions: user.roles?.flatMap(r => r.permissions || []) || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET ALL USERS (ADMIN)
=========================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Register.find()
      .populate('roles', 'name description')
      .select("-plainPassword -password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET USER BY ID (ADMIN)
=========================== */
export const getUserById = async (req, res) => {
  try {
    const user = await Register.findById(req.params.id)
      .populate('roles', 'name description')
      .select("-plainPassword -password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE USER DETAILS (ADMIN)
=========================== */
export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      address,
      city,
      country,
      consultant,
      marginType,
      flightMarginPercent,
      flightMarginAmount,
      creditAmount,
      status,
      agentStatus,
      password,
      registeredFrom,
      logo,
      role
    } = req.body;

    // If req.params.id exists, use it (admin updating user), otherwise use req.user.id (user updating own profile)
    const userId = req.params.id || req.user.id;
    const user = await Register.findById(userId).select("+password").populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Role change validation
    if (role) {
      // Prevent users from changing their own role
      if (user._id.toString() === req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Cannot change your own role"
        });
      }

      // IDENTITY SEPARATION: Block Agent role assignment from Admin Panel
      const Role = (await import('../models/Role.js')).default;
      const agentRole = await Role.findOne({ name: 'Agent' });
      const newRoleIds = Array.isArray(role) ? role : [role];

      // Check if trying to assign Agent role
      if (agentRole && newRoleIds.some(id => id.toString() === agentRole._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Agent role cannot be assigned from Admin Panel. Agents must register through the Agent Portal on the main website."
        });
      }

      // Check if removing Super Admin role
      const hasSuperAdmin = user.roles?.some(r => r.name === 'Super Admin');
      if (hasSuperAdmin) {
        const superAdminRole = await Role.findOne({ name: 'Super Admin' });
        const newRoleHasSuperAdmin = newRoleIds.some(id => id.toString() === superAdminRole._id.toString());

        if (!newRoleHasSuperAdmin) {
          const superAdminCount = await Register.countDocuments({
            roles: superAdminRole._id
          });

          if (superAdminCount <= 1) {
            return res.status(403).json({
              success: false,
              message: "Cannot remove Super Admin role from the last Super Admin. System must have at least one Super Admin."
            });
          }
        }
      }

      // Update roles
      user.roles = newRoleIds;
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (companyName !== undefined) user.companyName = companyName;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (consultant !== undefined) user.consultant = consultant;
    if (marginType !== undefined) user.marginType = marginType;
    if (flightMarginPercent !== undefined) user.flightMarginPercent = flightMarginPercent;
    if (flightMarginAmount !== undefined) user.flightMarginAmount = flightMarginAmount;
    if (creditAmount !== undefined) user.creditAmount = creditAmount;
    if (status !== undefined) user.status = status;
    if (agentStatus !== undefined) user.agentStatus = agentStatus;

    // Handle logo upload (supports base64 or Cloudinary URL from file upload)
    if (logo !== undefined) {
      user.logo = logo;
    } else if (req.file) {
      // If using Cloudinary multer upload
      user.logo = req.file.path;
    }

    if (registeredFrom !== undefined) {
      user.registeredFrom = {
        ...user.registeredFrom,
        ...registeredFrom
      };
    }

    if (password) {
      user.password = password;
      user.plainPassword = password;
      user.isAutoGeneratedPassword = false;
    }

    await user.save();

    const { password: _pwd, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: safeUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE USER STATUS
   - Supports both general status and agent status
   - Agent status managed separately for agent role workflow
=========================== */
export const updateUserStatus = async (req, res) => {
  try {
    const { status, agentStatus } = req.body;
    const updates = {};

    // Update general status if provided
    if (status) {
      updates.status = status;

      // Track who activated and when
      if (status === "Active") {
        updates.activatedBy = req.user?.name || req.user?.email || "Admin";
        updates.activatedAt = new Date();
        updates.deactivatedBy = "";
        updates.deactivatedAt = null;
      }

      // Track who deactivated and when
      if (status === "Inactive" || status === "Suspended") {
        updates.deactivatedBy = req.user?.name || req.user?.email || "Admin";
        updates.deactivatedAt = new Date();
        if (status === "Inactive") {
          updates.activatedAt = null;
        }
      }
    }

    // Update agent status if provided (separate workflow)
    if (agentStatus) {
      // If activating an agent, check the limit of 2 active agents
      if (agentStatus === "Active") {
        // Check if user has Agent role
        const currentUser = await Register.findById(req.params.id).populate('roles');
        const hasAgentRole = currentUser?.roles?.some(r => r.name === 'Agent');

        if (hasAgentRole) {
          // Find the Agent role
          const Role = (await import('../models/Role.js')).default;
          const agentRole = await Role.findOne({ name: 'Agent' });

          // Count currently active agents (excluding the current user being updated)
          const activeAgentsCount = await Register.countDocuments({
            roles: agentRole._id,
            agentStatus: 'Active',
            _id: { $ne: req.params.id }
          });

          if (activeAgentsCount >= 1000) {
            return res.status(403).json({
              success: false,
              message: "Maximum limit of 1000 active agents reached. Please deactivate another agent first."
            });
          }
        }
      }

      updates.agentStatus = agentStatus;

      // Track who activated agent and when
      if (agentStatus === "Active") {
        updates.agentActivatedBy = req.user?.name || req.user?.email || "Admin";
        updates.agentActivatedAt = new Date();
        updates.agentDeactivatedBy = "";
        updates.agentDeactivatedAt = null;
      }

      // Track who deactivated agent and when
      if (agentStatus === "Inactive" || agentStatus === "Suspended") {
        updates.agentDeactivatedBy = req.user?.name || req.user?.email || "Admin";
        updates.agentDeactivatedAt = new Date();
        if (agentStatus === "Inactive" || agentStatus === "Pending") {
          updates.agentActivatedAt = null;
        }
      }
    }

    const user = await Register.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Send email notification for agent status changes
    if (agentStatus && user.agencyCode) {
      const adminName = req.user?.name || req.user?.email || "Administrator";

      try {
        if (agentStatus === "Active") {
          // Agent approved/activated
          await sendAgentApprovalEmail(
            user.email,
            user.name,
            user.agencyCode,
            user.companyName || 'N/A',
            adminName
          );
          console.log(`✅ Agent approval email sent to: ${user.email}`);
        } else if (agentStatus === "Inactive" || agentStatus === "Suspended") {
          // Agent deactivated or suspended
          const reason = req.body.reason || "Status updated by administrator";
          await sendAgentStatusChangeEmail(
            user.email,
            user.name,
            user.agencyCode,
            user.companyName || 'N/A',
            agentStatus,
            reason,
            adminName
          );
          console.log(`✅ Agent status change email sent to: ${user.email}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send agent status email to ${user.email}:`, emailError.message);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: agentStatus
        ? "Agent status updated successfully"
        : "User status updated successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   DELETE USER
=========================== */
export const deleteUser = async (req, res) => {
  try {
    const user = await Register.findById(req.params.id).populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent deletion of Super Admin users
    const hasSuperAdminRole = user.roles?.some(r => r.name === 'Super Admin');
    if (hasSuperAdminRole) {
      // Check if this is the last Super Admin
      const Role = (await import('../models/Role.js')).default;
      const superAdminRole = await Role.findOne({ name: 'Super Admin' });
      const superAdminCount = await Register.countDocuments({ roles: superAdminRole._id });

      if (superAdminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete the last Super Admin. System must have at least one Super Admin."
        });
      }
    }

    // Prevent users from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    await Register.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   CHANGE PASSWORD (FOR LOGGED-IN USER)
=========================== */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const user = await Register.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    user.plainPassword = newPassword;
    user.isAutoGeneratedPassword = false;
    await user.save();

    // Send password change notification email
    try {
      await sendPasswordChangeNotification(user.email, user.name);
      console.log(`✅ Password change notification sent to: ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send password change notification to ${user.email}:`, emailError.message);
      // Don't fail the password change if email fails
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   REQUEST PASSWORD RESET (FORGOT PASSWORD)
   - Identity-aware: Uses portal-specific email templates
   - Agent Portal: Sends Agent-branded email with agentportal reset link
   - Admin Panel: Sends Internal-branded email with admin panel reset link
=========================== */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, portalType } = req.body; // portalType: 'agent-portal' or 'admin_portal'

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!portalType || !['agent-portal', 'admin_portal'].includes(portalType)) {
      return res.status(400).json({
        success: false,
        message: "Portal type is required and must be either 'agent-portal' or 'admin_portal'"
      });
    }

    const user = await Register.findOne({ email }).populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Validate that user has appropriate identity for the portal
    const agentRole = await Role.findOne({ name: 'Agent' });
    const hasAgentRole = user.roles?.some(r => r._id.toString() === agentRole?._id.toString());
    const hasInternalRoles = user.roles?.some(r => r._id.toString() !== agentRole?._id.toString());

    if (portalType === 'agent-portal' && !hasAgentRole) {
      return res.status(403).json({
        success: false,
        message: "This email is not registered as an agent. Please use the appropriate portal or contact support."
      });
    }

    if (portalType === 'admin_portal' && !hasInternalRoles) {
      return res.status(403).json({
        success: false,
        message: "This email is not registered as internal staff. Please use the Agent Portal if you are an agent."
      });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, type: "reset", portal: portalType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send identity-specific email
    try {
      if (portalType === 'agent-portal') {
        // Agent Portal - use Agent-branded email
        await sendAgentPasswordResetEmail(
          email,
          resetToken,
          user._id.toString(),
          user.name,
          user.companyName || 'Your Agency'
        );
      } else {
        // Admin Panel - use Internal Staff-branded email
        await sendAdminPasswordResetEmail(
          email,
          resetToken,
          user._id.toString(),
          user.name
        );
      }

      res.status(200).json({
        success: true,
        message: `Password reset link has been sent to your email for ${portalType === 'agent-portal' ? 'Agent Portal' : 'Internal Portal'} access`,
        // In development, you might want to include the token for testing
        ...(process.env.NODE_ENV === "development" && {
          resetToken: resetToken,
          userId: user._id
        })
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      // If email fails, still return token for testing (in dev only)
      if (process.env.NODE_ENV === "development") {
        return res.status(200).json({
          success: true,
          message: "Email service unavailable. Here's your reset token for testing:",
          resetToken: resetToken,
          userId: user._id
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   RESET PASSWORD (WITH RESET TOKEN)
   - Identity-aware: Validates token portal context matches
=========================== */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, userId, portalType } = req.body;

    if (!resetToken || !newPassword || !userId) {
      return res.status(400).json({
        success: false,
        message: "Reset token, user ID, and new password are required"
      });
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.type !== "reset" || decoded.id !== userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Validate portal context if provided (optional for backward compatibility)
    if (portalType && decoded.portal && decoded.portal !== portalType) {
      return res.status(403).json({
        success: false,
        message: "Reset token was issued for a different portal. Please request a new reset link from the correct portal."
      });
    }

    const user = await Register.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.password = newPassword;
    user.plainPassword = newPassword;
    user.isAutoGeneratedPassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Reset token has expired. Please request a new password reset link."
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token. Please request a new password reset link."
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   CHANGE USER PASSWORD (ADMIN ONLY)
=========================== */
export const changeUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required"
      });
    }

    const user = await Register.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.password = newPassword;
    user.plainPassword = newPassword;
    user.isAutoGeneratedPassword = false;
    await user.save();

    const populatedUser = await Register.findById(user._id).populate('roles');
    const roleName = populatedUser.roles?.[0]?.name || 'User';
    res.status(200).json({
      success: true,
      message: `Password for ${user.name} (${roleName}) has been changed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   SEND CREDENTIALS EMAIL
   - Identity-aware: Sends appropriate credentials based on user's identity
   - Agent identity: Uses sendAgentCredentialsEmail
   - Internal staff identity: Uses sendAdminCredentialsEmail
=========================== */
export const sendUserCredentials = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Register.findById(userId).populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.email || !user.plainPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required credentials. Ensure email and password are available."
      });
    }

    // Determine user's identity
    const agentRole = await Role.findOne({ name: 'Agent' });
    const hasAgentRole = user.roles?.some(r => r._id.toString() === agentRole?._id.toString());
    const hasInternalRoles = user.roles?.some(r => r._id.toString() !== agentRole?._id.toString());

    try {
      // Send identity-specific credentials email
      if (hasAgentRole && user.agencyCode) {
        // Has Agent identity - send Agent credentials
        await sendAgentCredentialsEmail(
          user.email,
          user.agencyCode,
          user.plainPassword,
          user.name,
          user.companyName || "Your Agency"
        );

        return res.status(200).json({
          success: true,
          message: `Agent credentials have been sent successfully to ${user.email}`
        });
      }

      if (hasInternalRoles) {
        // Has Internal Staff identity - send Internal credentials
        await sendAdminCredentialsEmail(
          user.email,
          user.email, // Internal staff use email as login
          user.plainPassword,
          user.name,
          user.roles.map(r => r.name).join(', ')
        );

        return res.status(200).json({
          success: true,
          message: `Internal staff credentials have been sent successfully to ${user.email}`
        });
      }

      // Fallback if user has no clear identity (shouldn't happen)
      return res.status(400).json({
        success: false,
        message: "User has no valid identity (Agent or Internal Staff). Cannot send credentials."
      });

    } catch (emailError) {
      console.error("Error sending credentials:", emailError);
      throw emailError;
    }
  } catch (error) {
    console.error("Error in sendUserCredentials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send credentials email. Please check email configuration."
    });
  }
};
