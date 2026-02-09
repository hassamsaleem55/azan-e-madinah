import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Menu,
    X,
    ChevronDown,
    ShieldCheck,
    LayoutDashboard,
    User as UserIcon,
    LogOut,
    MapPin,
    Wallet // Added Wallet icon
} from 'lucide-react';
import { groupTypes } from '../../data/groupTypes';
import logo from '../../assets/images/azan-e-madinah-logo.png'; // Update this path when you add the AZAN-E-MADINA logo

// --- Utility for cleaner conditional classes ---
const cn = (...classes) => classes.filter(Boolean).join(' ');

/* ---------- COMPONENT: NavLinks (Desktop) ---------- */
const NavLinks = ({ isScrolled, user }) => {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Logic to get active types
    const activeGroupTypes = searchParams.getAll('group_type').map(g => g.toLowerCase().trim());

    if (!user) return null;

    return (
        <ul className="flex items-center gap-1 xl:gap-2">
            {groupTypes.map(group => {
                const isAllGroups = group.path === 'all-groups';
                const isPathActive = location.pathname === `/${group.path}`;
                const isQueryActive = activeGroupTypes.includes(group.label.toLowerCase());

                const isActive = (isAllGroups && activeGroupTypes.length === 0 && isPathActive) ||
                    (!isAllGroups && (isPathActive || isQueryActive));

                return (
                    <li key={group.value}>
                        <Link
                            to={`/dashboard/${group.path}`}
                            className={cn(
                                "relative px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-1",
                                isActive
                                    ? (isScrolled ? "bg-gradient-to-r from-[#C9A536] via-[#E6C35C] to-[#C9A536] text-[#0B0E1A] shadow-lg shadow-[#C9A536]/50" : "bg-[#C9A536]/90 text-[#0B0E1A] backdrop-blur-md shadow-lg shadow-[#C9A536]/30 border-2 border-[#E6C35C]")
                                    : (isScrolled ? "text-gray-700 hover:bg-[#E6C35C] hover:text-[#0B0E1A]" : "text-white hover:bg-[#C9A536] hover:text-[#0B0E1A]")
                            )}
                        >
                            {group.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

/* ---------- COMPONENT: UserMenu ---------- */
const UserMenu = ({ user, handleLogout, isScrolled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = event => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (path, action) => {
        setIsOpen(false);
        if (action) action();
        if (path) navigate(path);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border-2 transition-all duration-300",
                    isScrolled
                        ? "bg-white border-[#C9A536]/30 text-gray-800 shadow-md hover:border-[#C9A536] hover:ring-2 hover:ring-[#C9A536]/30 hover:shadow-lg hover:shadow-[#C9A536]/20"
                        : "bg-black/30 border-[#C9A536]/50 text-white backdrop-blur-md hover:bg-[#C9A536]/20 hover:border-[#E6C35C]"
                )}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A536] via-[#E6C35C] to-[#C9A536] text-[#0B0E1A] flex items-center justify-center font-bold text-sm shadow-md shadow-[#C9A536]/50">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col items-start text-xs">
                    <span className="font-bold leading-none mb-0.5">{user.name.split(' ')[0]}</span>
                    <span className={cn("leading-none opacity-80", isScrolled ? "text-gray-500" : "text-blue-100")}>
                        Agent
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={cn("transition-transform duration-300 ml-1 opacity-70", isOpen && "rotate-180")}
                />
            </button>

            {/* Dropdown Content */}
            <div className={cn(
                "absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right z-50",
                isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            )}>
                {/* Header Section with User Info & Balance */}
                <div className="p-5 bg-linear-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-[#0A1628] truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{user.companyName || 'Travel Agency'}</p>
                    </div>

                    {/* --- WALLET BALANCE (Moved Inside) --- */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm">
                                <Wallet size={16} />
                            </div>
                            <span className="text-xs font-semibold text-emerald-800">Balance</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                            PKR {formatCurrency(user.creditAmount)}
                        </span>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                    {user.role === 'Admin' && (
                        <button onClick={() => handleAction('/admin-portal')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F5E6C8] hover:text-[#0A1628] rounded-xl transition-colors">
                            <ShieldCheck size={18} /> Admin Portal
                        </button>
                    )}

                    <button onClick={() => handleAction('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F5E6C8] hover:text-[#0A1628] rounded-xl transition-colors">
                        <LayoutDashboard size={18} /> Agent Dashboard
                    </button>

                    <button onClick={() => handleAction('/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#F5E6C8] hover:text-[#0A1628] rounded-xl transition-colors">
                        <UserIcon size={18} /> My Profile
                    </button>

                    <div className="h-px bg-gray-100 my-1 mx-2" />

                    <button onClick={() => handleAction(undefined, handleLogout)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ---------- MAIN COMPONENT: Header ---------- */
export default function Header({ user, handleLogout }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Scroll Handler
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            {/* HEADER */}
            <nav
                className={cn(
                    "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out px-4 md:px-6 lg:px-8 border-b",
                    isScrolled
                        ? "bg-gradient-to-r from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] backdrop-blur-md shadow-xl shadow-[#C9A536]/10 py-3 border-[#C9A536]/20"
                        : "bg-transparent py-5 border-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-full shrink-0 transition-opacity hover:opacity-90"
                    >
                        {/* <div className="bg-white rounded-lg p-1.5 shadow-sm"> */}
                            <img
                                src={logo}
                                alt="AZAN-E-MADINA Logo"
                                className="w-16 sm:w-20 object-contain rounded-lg"
                            />
                        {/* </div> */}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex flex-1 justify-center px-8">
                        <NavLinks isScrolled={isScrolled} user={user} />
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <UserMenu
                                user={user}
                                handleLogout={handleLogout}
                                isScrolled={isScrolled}
                            />
                        ) : (
                            !isMobileMenuOpen && (
                                <Link
                                    to="/auth/register"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className={cn(
                                        "hidden sm:flex px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 border-2",
                                        isScrolled
                                            ? "bg-gradient-to-r from-[#C9A536] via-[#E6C35C] to-[#C9A536] text-[#0B0E1A] hover:shadow-[#C9A536]/50 border-[#E6C35C]"
                                            : "bg-[#C9A536] text-[#0B0E1A] hover:bg-[#E6C35C] shadow-[#C9A536]/40 border-[#E6C35C]"
                                    )}
                                >
                                    Partner With Us
                                </Link>
                            )
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={cn(
                                "lg:hidden p-2 rounded-full transition-colors",
                                isScrolled
                                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                            )}
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <div
                className={cn(
                    "lg:hidden fixed inset-0 z-50 transition-all duration-300",
                    isMobileMenuOpen ? "visible" : "invisible"
                )}
            >
                {/* Backdrop */}
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                        isMobileMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Drawer */}
                <div
                    className={cn(
                        "absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                        <img src={logo} alt="Logo" className="w-24 object-contain" />
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Info & Balance (Mobile) */}
                    {user && (
                        <div className="p-5 bg-gradient-to-br from-[#0B0E1A] via-[#151B2E] to-[#0B0E1A] text-white space-y-4 border-b-2 border-[#C9A536]/30">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A536] via-[#E6C35C] to-[#C9A536] flex items-center justify-center font-bold text-xl text-[#0B0E1A] shadow-lg shadow-[#C9A536]/50">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-[#E6C35C]">{user.name}</p>
                                    <p className="text-xs text-gray-300">{user.email}</p>
                                </div>
                            </div>

                            {/* Mobile Credit Display */}
                            <div className="bg-gradient-to-r from-[#C9A536]/20 to-[#A68A2E]/20 rounded-xl p-3 flex items-center justify-between border-2 border-[#C9A536]/40 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <Wallet size={16} className="text-[#10B981]" />
                                    <span className="text-sm font-bold text-white">Balance</span>
                                </div>
                                <span className="font-bold text-[#E6C35C] text-lg">PKR {formatCurrency(user.creditAmount)}</span>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {!user && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Access</h3>
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex w-full items-center justify-center py-3.5 rounded-xl border-2 border-[#C9A536] text-gray-800 font-bold bg-white hover:bg-[#E6C35C]/20"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/auth/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex w-full items-center justify-center py-3.5 rounded-xl bg-gradient-to-r from-[#C9A536] via-[#E6C35C] to-[#C9A536] text-[#0B0E1A] font-bold shadow-xl shadow-[#C9A536]/40"
                                >
                                    Partner Sign Up
                                </Link>
                            </div>
                        )}

                        {user && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Destinations</h3>
                                    {groupTypes.map(group => (
                                        <Link
                                            key={group.value}
                                            to={`/${group.path}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 bg-gray-50 font-medium hover:bg-gradient-to-r hover:from-[#C9A536]/20 hover:to-[#E6C35C]/20 hover:text-[#0B0E1A] hover:border-l-4 hover:border-[#C9A536] transition-all"
                                        >
                                            {group.label}
                                            <MapPin size={16} className="text-gray-400" />
                                        </Link>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account</h3>
                                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:text-[#C9A536] hover:bg-[#E6C35C]/10 rounded-lg">
                                        <LayoutDashboard size={20} /> Dashboard
                                    </Link>
                                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:text-[#C9A536] hover:bg-[#E6C35C]/10 rounded-lg">
                                        <UserIcon size={20} /> Profile
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Drawer Footer */}
                    {user && (
                        <div className="p-5 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-white border border-red-100 text-red-600 font-bold shadow-sm hover:bg-red-50"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}