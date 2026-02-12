import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  requiredRoles?: string[];
  requiredPermission?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; requiredPermission?: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    requiredPermission: "dashboard.view",
  },
  {
    icon: <TableIcon />,
    name: "Bookings & Tickets",
    requiredPermission: "bookings.view",
    subItems: [
      { name: "All Bookings", path: "/all-bookings", pro: false, requiredPermission: "bookings.view" },
      { name: "View Groups", path: "/group-ticketing", pro: false, requiredPermission: "groups.view" },
      { name: "Create Group", path: "/group-ticketing/create", pro: false, requiredPermission: "groups.create" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Travel Services",
    requiredPermission: "packages.view",
    subItems: [
      { name: "Packages", path: "/packages", pro: false, requiredPermission: "packages.view" },
      { name: "Flight Packages", path: "/flight-packages", pro: false, requiredPermission: "packages.view" },
      { name: "Flights", path: "/flights", pro: false, requiredPermission: "airlines.view" },
      { name: "Hotels", path: "/hotels", pro: false, requiredPermission: "hotels.view" },
      { name: "Tours", path: "/tours", pro: false, requiredPermission: "tours.view" },
      { name: "Visas", path: "/visas", pro: false, requiredPermission: "visas.view" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Agencies",
    path: "/registered-agencies",
    requiredPermission: "agencies.view",
  },
  {
    icon: <TableIcon />,
    name: "Financial",
    requiredPermission: "ledger.view",
    subItems: [
      { name: "View Accounts", path: "/view-accounts", pro: false, requiredPermission: "ledger.view" },
      { name: "Payment Vouchers", path: "/view-payment-voucher", pro: false, requiredPermission: "payments.view" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Content",
    requiredPermission: "content.view",
    subItems: [
      { name: "CMS", path: "/content-management", pro: false, requiredPermission: "content.view" },
      { name: "Testimonials", path: "/testimonials", pro: false, requiredPermission: "testimonials.view" },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Configuration",
    requiredPermission: "banks.view",
    subItems: [
      { name: "Banks", path: "/add-bank", pro: false, requiredPermission: "banks.view" },
      { name: "Sectors", path: "/sector", pro: false, requiredPermission: "sectors.view" },
      { name: "Airlines", path: "/airline", pro: false, requiredPermission: "airlines.view" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Settings",
    requiredPermission: "settings.roles",
    subItems: [
      { name: "Users", path: "/settings/users", pro: false, requiredPermission: "settings.roles" },
      { name: "Roles", path: "/settings/roles", pro: false, requiredPermission: "settings.roles" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { isSuperAdmin, activeRole, hasPermission } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1.5">
      {items
        .filter(nav => {
          // Check if user has required role for this menu item
          if (nav.requiredRoles && nav.requiredRoles.length > 0) {
            const hasRequiredRole = nav.requiredRoles.includes(activeRole?.name || '');
            if (!hasRequiredRole && !isSuperAdmin()) {
              return false;
            }
          }
          
          // Check if user has required permission for this menu item
          if (nav.requiredPermission && !hasPermission(nav.requiredPermission) && !isSuperAdmin()) {
            return false;
          }
          
          return true;
        })
        .map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group relative ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group relative ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-0.5 ml-9 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-2">
                {nav.subItems
                  .filter(subItem => {
                    // Filter sub-items based on permissions
                    if (subItem.requiredPermission && !hasPermission(subItem.requiredPermission) && !isSuperAdmin()) {
                      return false;
                    }
                    return true;
                  })
                  .map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                        isActive(subItem.path)
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full transition-all ${
                        isActive(subItem.path)
                          ? "bg-white"
                          : "bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-600 dark:group-hover:bg-gray-400"
                      }`}></span>
                      <span className="flex-1">{subItem.name}</span>
                      <span className="flex items-center gap-1">
                        {subItem.new && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded uppercase ${
                            isActive(subItem.path)
                              ? "bg-white/20 text-white"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}>
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded uppercase ${
                            isActive(subItem.path)
                              ? "bg-white/20 text-white"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}>
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link 
          to="/" 
          className="relative group transition-all duration-300 ease-in-out"
        >
          <div className={`p-1 relative overflow-hidden rounded-xl bg-[#C9A536] shadow-xl shadow-[#C9A536]/40 dark:from-gray-800 dark:to-gray-700 transition-all duration-300 ${
            isExpanded || isHovered || isMobileOpen 
              ? "shadow-lg hover:shadow-xl" 
              : "shadow-md hover:shadow-lg"
          }`}>
            {isExpanded || isHovered || isMobileOpen ? (
              <img
                src="/admin-portal/images/logo/azan-e-madinah-logo.png"
                alt="Azan-e-Madinah Logo"
                width={80}
                height={40}
                className="relative z-10 transition-transform duration-300 group-hover:scale-105 rounded-xl"
              />
            ) : (
              <img
                src="/admin-portal/images/logo/azan-e-madinah-logo.png"
                alt="Azan-e-Madinah Logo"
                width={40}
                height={40}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110 rounded-xl"
              />
            )}
            {/* Elegant shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-2.5">
            <div>
              <h2
                className={`mb-3 text-[10px] font-bold uppercase tracking-wider flex leading-[20px] text-gray-400 dark:text-gray-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Main Menu"
                ) : (
                  <HorizontaLDots className="size-5" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Copyright Footer */}
      <div className={`py-4 px-2 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 ${!isExpanded && !isHovered ? "lg:text-center" : "text-center"}`}>
        {isExpanded || isHovered || isMobileOpen ? (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} All rights reserved
            </p>
            <a 
              href="https://nexagensolution.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              Powered by Nexagen Solutions
            </a>
          </div>
        ) : (
          <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()}
          </p>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
