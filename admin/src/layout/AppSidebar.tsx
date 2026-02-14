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
    icon: <UserCircleIcon />,
    name: "Agencies",
    path: "/registered-agencies",
    requiredPermission: "agencies.view",
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
              } cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-xl ${
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
                className={`menu-item group relative transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-xl ${
                  isActive(nav.path) ? "menu-item-active shadow-lg" : "menu-item-inactive"
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
              <ul className="mt-2.5 space-y-1 ml-4 bg-linear-to-b from-brand-50/50 via-brand-50/25 to-transparent dark:from-brand-900/20 dark:via-brand-900/10 dark:to-transparent rounded-xl p-3 border border-brand-100/70 dark:border-brand-900/40 backdrop-blur-sm shadow-inner transition-all duration-300">
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
                      className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                        isActive(subItem.path)
                          ? "bg-linear-to-r from-brand-500 via-brand-550 to-brand-600 text-white shadow-md shadow-brand-500/30 scale-[1.02]"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-white hover:to-gray-50 dark:hover:from-gray-800/70 dark:hover:to-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm hover:translate-x-0.5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive(subItem.path)
                          ? "bg-white shadow-sm shadow-white/50"
                          : "bg-gray-400 dark:bg-gray-600 group-hover:bg-brand-500 dark:group-hover:bg-brand-400 group-hover:shadow-sm"
                      }`}></span>
                      <span className="flex-1 font-medium">{subItem.name}</span>
                      <span className="flex items-center gap-1.5">
                        {subItem.new && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm ${
                            isActive(subItem.path)
                              ? "bg-white/20 text-white backdrop-blur-sm"
                              : "bg-linear-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-400"
                          }`}>
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm ${
                            isActive(subItem.path)
                              ? "bg-white/20 text-white backdrop-blur-sm"
                              : "bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-400"
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
      className={`fixed left-0 flex flex-col px-5 backdrop-blur-2xl bg-gradient-to-b from-white/98 via-white/96 to-white/98 dark:from-gray-900/98 dark:via-gray-900/96 dark:to-gray-900/98 text-gray-900 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-gray-200/60 dark:border-gray-800/60 shadow-xl shadow-gray-300/10 dark:shadow-black/30
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0 z-[1045] top-16 h-[calc(100vh-4rem)]" : "-translate-x-full z-[1050] top-0 h-screen"}
        lg:translate-x-0 lg:z-[1050] lg:top-0 lg:h-screen`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
        }`}
      >
        <Link 
          to="/" 
          className="relative group transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#C9A536]/40 focus:ring-offset-4 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-2xl"
        >
          <div className={`p-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#C9A536] via-[#D4B044] to-[#C9A536] shadow-xl shadow-[#C9A536]/25 dark:shadow-[#C9A536]/15 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A536]/40 dark:hover:shadow-[#C9A536]/30 hover:rotate-2 ${
            isExpanded || isHovered || isMobileOpen 
              ? "hover:scale-105" 
              : "hover:scale-110"
          } group-active:scale-95`}>
            {isExpanded || isHovered || isMobileOpen ? (
              <img
                src="/admin-portal/images/logo/azan-e-madinah-logo.png"
                alt="Azan-e-Madinah Logo"
                width={70}
                height={35}
                className="relative z-10 transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 rounded-lg drop-shadow-md object-contain"
              />
            ) : (
              <img
                src="/admin-portal/images/logo/azan-e-madinah-logo.png"
                alt="Azan-e-Madinah Logo"
                width={36}
                height={36}
                className="relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-2 rounded-lg drop-shadow-md object-contain"
              />
            )}
            {/* Elegant animated shine effect on hover */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar flex-1 px-1 scroll-smooth py-2">
        <nav className="mb-4">
          <div className="flex flex-col gap-2.5">
            <div>
              <h2
                className={`mb-3 text-[10px] font-bold uppercase tracking-widest flex leading-[20px] text-gray-500 dark:text-gray-400 ${
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
      
      {/* Premium Copyright Footer */}
      <div className={`py-4 px-2 border-t border-gray-200/60 dark:border-gray-800/60 bg-linear-to-b from-transparent via-gray-50/40 to-gray-100/60 dark:from-transparent dark:via-gray-900/40 dark:to-gray-950/60 backdrop-blur-md transition-all duration-300 ${!isExpanded && !isHovered ? "lg:text-center" : "text-center"}`}>
        {isExpanded || isHovered || isMobileOpen ? (
          <div className="space-y-1.5 animate-fadeIn">
            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
              © {new Date().getFullYear()} All rights reserved
            </p>
            <a 
              href="https://nexagensolution.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] bg-linear-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent hover:from-brand-500 hover:to-brand-600 font-bold transition-all duration-300 inline-flex items-center gap-1 tracking-wide hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 rounded"
            >
              Powered by Nexagen Solutions
            </a>
          </div>
        ) : (
          <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()}
          </p>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
