import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
      style={{ zIndex: 1044, top: '4rem' }}
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
