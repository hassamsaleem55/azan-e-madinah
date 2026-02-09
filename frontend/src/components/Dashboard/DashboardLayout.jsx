import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronDown, ChevronRight, Menu, X,
    LayoutDashboard, Users, Ticket, Landmark, 
    CreditCard, BookOpen, User, Key, LogOut,
    Wallet 
} from "lucide-react";
import logo from '../../assets/images/rihla_logo.png';

const DashboardLayout = ({ user, handleLogout }) => {
  // Initialize: Closed on mobile (<1024px), Open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize to auto-adjust sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', exact: true },
    { path: '/dashboard/all-groups', icon: <Users size={20} />, label: 'All Groups' },
    {
      path: '/dashboard/my-bookings',
      icon: <Ticket size={20} />,
      label: 'My Bookings',
      hasSubMenu: true,
      subItems: [
        { path: '/dashboard/my-bookings?status=on hold', label: 'On Hold' },
        { path: '/dashboard/my-bookings?status=confirmed', label: 'Confirmed' },
        { path: '/dashboard/my-bookings?status=cancelled', label: 'Cancelled' },
        { path: '/dashboard/my-bookings', label: 'All Bookings' },
      ]
    },
    { path: '/dashboard/banks', icon: <Landmark size={20} />, label: 'Bank Details' },
    { path: '/dashboard/payment', icon: <CreditCard size={20} />, label: 'Payments' },
    { path: '/dashboard/ledger', icon: <BookOpen size={20} />, label: 'Ledger' },
    { path: '/dashboard/profile', icon: <User size={20} />, label: 'My Profile' },
    { path: '/dashboard/change-password', icon: <Key size={20} />, label: 'Change Password' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`
            fixed lg:static top-0 left-0 h-full bg-[#003366] text-white shadow-2xl z-30
            transition-all duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-blue-800/40 bg-[#002244]">
          <Link 
            to="/" 
            className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? 'justify-start' : 'justify-center w-full'}`}
          >
             <div className="bg-white h-10 w-10 flex items-center justify-center rounded-xl shadow-lg shadow-blue-900/50 shrink-0 overflow-hidden p-1">
                <img src={logo} alt="Rihla" className="w-full h-full object-contain" />
             </div>

             <div className={`flex flex-col transition-all duration-300 origin-left ${sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0 hidden'}`}>
                <span className="font-extrabold text-lg tracking-wide leading-none text-white">RIHLA</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-300 leading-none mt-0.5">ACCESS</span>
             </div>
          </Link>

          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors ${!sidebarOpen && 'hidden'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 custom-scrollbar space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.hasSubMenu ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                          if (!sidebarOpen) setSidebarOpen(true);
                          setBookingsExpanded(!bookingsExpanded);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group
                        ${isActive(item.path, item.exact) 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${!sidebarOpen && "mx-auto"}`}>{item.icon}</span>
                        <span className={`text-sm font-medium transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            {item.label}
                        </span>
                      </div>
                      {sidebarOpen && (
                          <span className="text-blue-300 group-hover:text-white transition-colors">
                            {bookingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                      )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${bookingsExpanded && sidebarOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <ul className="pl-3 mt-1 space-y-1 ml-3 border-l-2 border-blue-800/50">
                        {item.subItems.map((subItem) => {
                          const currentPath = location.pathname;
                          const currentStatus = new URLSearchParams(location.search).get('status') || '';
                          const subItemStatus = subItem.path.includes('?status=') ? subItem.path.split('status=')[1] : '';
                          const isSubActive = currentPath === '/dashboard/my-bookings' && currentStatus === subItemStatus;
                          
                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                className={`
                                    block px-4 py-2 text-xs rounded-r-lg transition-colors relative
                                    ${isSubActive ? 'text-white font-bold bg-blue-800/50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-400 before:rounded-r' : 'text-blue-300 hover:text-white hover:bg-white/5'}
                                `}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => {
                        if (!sidebarOpen) setSidebarOpen(true);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive(item.path, item.exact) 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <span className={`${!sidebarOpen && "mx-auto"}`}>{item.icon}</span>
                    <span className={`text-sm font-medium whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.label}
                    </span>
                    
                    {!sidebarOpen && (
                        <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {item.label}
                        </div>
                    )}
                  </Link>
                )}
              </div>
            ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-800/40 bg-[#002855]">
          <button 
            onClick={handleLogoutClick} 
            className={`
                w-full flex items-center rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200
                ${sidebarOpen ? 'px-4 py-3 gap-3' : 'justify-center py-3'}
            `}
            title="Logout"
          >
            <LogOut size={20} />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50">
        
        {/* Top Header */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-10">
          <button 
            onClick={toggleSidebar} 
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* --- CREDIT AMOUNT DISPLAY (Visible on Mobile) --- */}
            {/* Removed 'hidden sm:flex', changed to 'flex', adjusted padding/text size for mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="hidden xs:inline text-xs font-semibold text-gray-600">Balance:</span>
                <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">PKR {formatCurrency(user?.creditAmount)}</span>
            </div>

            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-800 leading-none">{user?.name || 'Agent'}</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1.5 border border-blue-100">
                    {user?.companyName || 'Agency Partner'}
                </span>
            </div>
            
            <div className="relative group cursor-pointer">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-linear-to-br from-[#003366] to-blue-600 p-0.5 shadow-md">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                        <span className="font-bold text-[#003366] text-xs sm:text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth">
           <div className="mx-auto pb-10 animate-in fade-in duration-500">
              <Outlet context={{ user }} />
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;