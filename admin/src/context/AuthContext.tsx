import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axiosInstance from "../Api/axios";

/* ================= TYPES ================= */

interface Permission {
  _id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roles?: Role[];  // All assigned roles
  companyName: string;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  activeRole: Role | null;
  availableRoles: Role[];
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: (skipLoading?: boolean) => Promise<void>;
  switchRole: (roleId: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isSuperAdmin: () => boolean;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);      // initial session check
  const [loggingIn, setLoggingIn] = useState(false); // active login state

  /* ---------- LOGOUT ---------- */
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("active_role_id");
    setUser(null);
    setPermissions([]);
    setActiveRole(null);
    setAvailableRoles([]);
  }, []);

  /* ---------- REFRESH USER FROM TOKEN ---------- */
  const refreshUser = useCallback(async (skipLoading = false) => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setUser(null);
      setPermissions([]);
      setActiveRole(null);
      setAvailableRoles([]);
      if (!skipLoading) setLoading(false);
      return;
    }

    try {
      if (!skipLoading) setLoading(true);

      const res = await axiosInstance.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && res.data.data) {
        const userData = res.data.data;
        setUser(userData);
        
        // Handle multiple roles, filter out Agent role in admin panel
        const roles = userData.roles || (userData.role ? [userData.role] : []);
        const filteredRoles = roles.filter((r: Role) => r.name !== 'Agent');
        setAvailableRoles(filteredRoles);
        
        // Set active role from localStorage or default to first role
        const savedRoleId = localStorage.getItem("active_role_id");
        const savedRole = filteredRoles.find((r: Role) => r._id === savedRoleId);
        const defaultRole = savedRole || filteredRoles[0] || null;
        
        setActiveRole(defaultRole);
        if (defaultRole) {
          localStorage.setItem("active_role_id", defaultRole._id);
          // Set permissions ONLY from active role
          setPermissions(defaultRole.permissions || []);
        } else {
          setPermissions([]);
        }
      } else {
        throw new Error("Invalid token");
      }
    } catch (err) {
      console.error("Auth refresh failed:", err);
      setUser(null);
      setPermissions([]);
      setActiveRole(null);
      setAvailableRoles([]);
      logout();
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, [logout]);

  /* ---------- AUTO LOGOUT ON TOKEN EXPIRY ---------- */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    let timer: ReturnType<typeof setTimeout>;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = payload.exp * 1000 - Date.now();

      if (expiresIn > 0) {
        timer = setTimeout(logout, expiresIn);
      } else {
        logout();
      }
    } catch {
      logout();
    }

    return () => clearTimeout(timer);
  }, [logout]);

  /* ---------- INITIAL SESSION CHECK ---------- */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /* ---------- LOGIN ---------- */
  const login = async (token: string) => {
    localStorage.setItem("admin_token", token);
    setLoggingIn(true);
    await refreshUser(true); // avoid loading flicker
    setLoggingIn(false);
  };

  /* ---------- SWITCH ROLE ---------- */
  const switchRole = useCallback((roleId: string) => {
    const role = availableRoles.find(r => r._id === roleId);
    if (role) {
      setActiveRole(role);
      localStorage.setItem("active_role_id", roleId);
      
      // Update permissions based on selected role
      setPermissions(role.permissions || []);
      
      // Don't reload or refresh - just update state
      // The state changes will trigger re-renders throughout the app
    }
  }, [availableRoles]);

  /* ---------- CONTEXT VALUE ---------- */
  const value: AuthContextType = {
    user,
    permissions,
    activeRole,
    availableRoles,
    login,
    logout,
    refreshUser,
    switchRole,
    isAuthenticated: !!user,
    loading: loading || loggingIn,
    hasPermission: (permissionCode: string) => 
      permissions.some(p => p.code === permissionCode && p.isActive),
    hasRole: (roleName: string) => 
      activeRole?.name === roleName,
    isSuperAdmin: () => 
      activeRole?.name === 'Super Admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ================= HOOK ================= */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
