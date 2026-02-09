import jwt from "jsonwebtoken";
import Register from "../models/Register.js";
import axios from "axios";

let cachedToken = null;
let tokenExpiry = null

/* ===========================
   AUTHENTICATION MIDDLEWARE
   - Verifies JWT token and attaches user to request
=========================== */
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized. Please login." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Populate user with roles and their permissions
    req.user = await Register.findById(decoded.id)
      .populate({
        path: 'roles',
        populate: { path: 'permissions' }
      })
      .select('-password -plainPassword');

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Attach user ID for convenience
    req.user.id = req.user._id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};

/* ===========================
   ROLE-BASED MIDDLEWARE
=========================== */

// Check if user has Admin, Super Admin, or any non-Agent role
export const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied" 
    });
  }

  // Check if user has any non-agent admin role
  const hasAdminRole = req.user.roles.some(role => 
    role.name !== 'Agent'
  );
  
  if (!hasAdminRole) {
    return res.status(403).json({ 
      success: false,
      message: "Admin access only" 
    });
  }
  
  next();
};

// Check if user has Agent role
export const agentOnly = (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied" 
    });
  }

  const hasAgentRole = req.user.roles.some(role => 
    role.name === 'Agent'
  );
  
  if (!hasAgentRole) {
    return res.status(403).json({ 
      success: false,
      message: "Agent access only" 
    });
  }
  
  next();
};

// Check if user has Super Admin role
export const superAdminOnly = (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied" 
    });
  }

  const isSuperAdmin = req.user.roles.some(role => 
    role.name === 'Super Admin'
  );
  
  if (!isSuperAdmin) {
    return res.status(403).json({ 
      success: false,
      message: "Super Admin access only" 
    });
  }
  
  next();
};

// Check if user has specific role(s)
export const hasRole = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const userRoleNames = req.user.roles.map(r => r.name);
    const hasRequiredRole = roleNames.some(roleName => 
      userRoleNames.includes(roleName)
    );
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role(s): ${roleNames.join(', ')}` 
      });
    }
    
    next();
  };
};

// Check if user has ALL specified roles
export const hasAllRoles = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    const userRoleNames = req.user.roles.map(r => r.name);
    const hasAllRequiredRoles = roleNames.every(roleName => 
      userRoleNames.includes(roleName)
    );
    
    if (!hasAllRequiredRoles) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required all roles: ${roleNames.join(', ')}` 
      });
    }
    
    next();
  };
};

/* ===========================
   STATUS-BASED MIDDLEWARE
=========================== */

// Check if user's general status is Active
export const activeUserOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied" 
    });
  }

  if (req.user.status !== 'Active') {
    return res.status(403).json({ 
      success: false,
      message: "Your account is not active. Please contact administrator." 
    });
  }
  
  next();
};

// Check if user's agent status is Active (for agent operations)
export const activeAgentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied" 
    });
  }

  const hasAgentRole = req.user.roles && req.user.roles.some(role => 
    role.name === 'Agent'
  );
  
  if (!hasAgentRole) {
    return res.status(403).json({ 
      success: false,
      message: "Agent role required" 
    });
  }

  if (req.user.agentStatus !== 'Active') {
    return res.status(403).json({ 
      success: false,
      message: "Your agent account is not active. Please contact administrator." 
    });
  }
  
  next();
};

/* ===========================
   FLYING ZONE AUTHENTICATION MIDDLEWARE
=========================== */

export const flyingZoneAuthMiddleware = async (req, res, next) => {
  try {
    // Reuse token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      req.flyingZoneToken = cachedToken;
      return next();
    }

    const response = await axios.post(
      `${process.env.FLYING_ZONE_API_URL}/login`,
      {
        agent_code: process.env.FLYING_ZONE_AGENT_CODE,
        email: process.env.FLYING_ZONE_API_EMAIL,
        password: process.env.FLYING_ZONE_API_PASSWORD,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const token = response.data?.token;
    const expiresIn = response.data?.expires_in || 3600;

    cachedToken = token;
    tokenExpiry = Date.now() + expiresIn * 1000 - 60 * 1000;

    req.flyingZoneToken = token;

    next();
  } catch (error) {
    console.error("FLYING ZONE AUTH FAILED:", error.message);

    // Don’t block whole system if external API fails
    req.flyingZoneToken = null;
    next();
  }
};