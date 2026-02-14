import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import UserDropdown from "../components/header/UserDropdown";
import RoleSwitcher from "../components/RoleSwitcher";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, isExpanded, isHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    // Close application menu when toggling sidebar
    setApplicationMenuOpen(false);
    
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  // Close application menu when sidebar opens on mobile
  useEffect(() => {
    if (isMobileOpen) {
      setApplicationMenuOpen(false);
    }
  }, [isMobileOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Close mobile menu on Escape key
      if (event.key === "Escape" && isApplicationMenuOpen) {
        setApplicationMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Close mobile menu when clicking outside on mobile
      if (isApplicationMenuOpen && window.innerWidth < 1024) {
        const target = event.target as HTMLElement;
        if (!target.closest('header')) {
          setApplicationMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isApplicationMenuOpen]);

  return (
    <header className={`fixed top-0 right-0 h-16 backdrop-blur-2xl bg-gradient-to-r from-white/98 via-white/96 to-white/98 dark:from-gray-900/98 dark:via-gray-900/96 dark:to-gray-900/98 border-b border-gray-200/60 dark:border-gray-800/60 z-[1040] shadow-xl shadow-gray-300/10 dark:shadow-black/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
      isExpanded || isHovered ? "left-0 lg:left-[290px]" : "left-0 lg:left-[90px]"
    }`}>
      <div className="flex items-center justify-between w-full h-full px-4 lg:px-6">
        <div className="flex items-center gap-3 lg:gap-4 h-full">
          {/* Sidebar Toggle Button */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-600 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-lg border border-gray-200/50 dark:border-gray-700/50 dark:text-gray-400 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-750 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden hover:opacity-80 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C9A536]/50 focus:ring-offset-2 rounded-lg flex items-center">
            <img
              className="w-10 h-10 object-contain drop-shadow-md"
              src="/admin-portal/images/logo/azan-e-madinah-logo.png"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-end gap-4 h-full">
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <ThemeToggleButton />
          </div>
          <UserDropdown />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleApplicationMenu}
          className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:from-gray-200 hover:to-gray-100 dark:text-gray-400 dark:hover:from-gray-700 dark:hover:to-gray-750 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          aria-label="Toggle Application Menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {isApplicationMenuOpen && (
          <>
            {/* Backdrop for mobile menu */}
            <div 
              className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1049] transition-opacity duration-200" 
              style={{ top: '4rem' }}
              onClick={() => setApplicationMenuOpen(false)}
            />
            
            {/* Mobile menu content */}
            <div className="lg:hidden fixed top-16 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-xl shadow-gray-300/10 dark:shadow-black/30 z-[1050] animate-fadeIn">
              <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <RoleSwitcher />
                  <ThemeToggleButton />
                </div>
                <UserDropdown />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
