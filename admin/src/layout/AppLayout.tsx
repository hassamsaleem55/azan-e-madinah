import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-x-hidden">
      {/* Subtle animated background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10 pointer-events-none"></div>
      
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main
          className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pt-16 min-h-screen w-full ${
            isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          }`}
        >
          <div className="p-4 sm:p-6 md:p-8 container mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
