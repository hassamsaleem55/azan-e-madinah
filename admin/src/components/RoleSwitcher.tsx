import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Users, Shield, CheckCircle } from 'lucide-react';

const RoleSwitcher = () => {
  const { activeRole, availableRoles, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show if user has only one role
  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (roleId: string) => {
    switchRole(roleId);
    setIsOpen(false);
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName === 'Super Admin' || roleName === 'Admin') {
      return <Shield className="w-4 h-4" />;
    }
    return <Users className="w-4 h-4" />;
  };

  const getRoleColor = (roleName: string) => {
    if (roleName === 'Super Admin') return 'text-purple-600 bg-purple-50';
    if (roleName === 'Admin') return 'text-blue-600 bg-blue-50';
    if (roleName === 'Agent') return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Role Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg
          ${getRoleColor(activeRole?.name || '')}
          hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-400/20
        `}
      >
        <div className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">
          {getRoleIcon(activeRole?.name || '')}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold opacity-70 uppercase tracking-wide">Active Role</span>
          <span className="text-sm font-bold">{activeRole?.name || 'Select Role'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 w-72 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-brand-500/10 dark:shadow-brand-500/5 border border-gray-200/50 dark:border-gray-700/50 z-[1000] overflow-hidden animate-scaleIn origin-top-right">
          <div className="px-4 py-3 bg-gradient-to-r from-brand-50/50 to-transparent dark:from-brand-900/20 dark:to-transparent border-b border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Switch Role
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto premium-scrollbar p-2">
            {availableRoles.map((role) => (
              <button
                key={role._id}
                onClick={() => handleRoleSwitch(role._id)}
                className={`
                  w-full px-3 py-3 flex items-center justify-between gap-3 rounded-xl
                  hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100/50 dark:hover:from-brand-900/20 dark:hover:to-brand-900/10
                  transition-all duration-300 text-left hover:shadow-sm hover:translate-x-1
                  ${activeRole?._id === role._id ? 'bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-900/15 shadow-sm' : ''}
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2.5 rounded-xl shadow-sm ${getRoleColor(role.name)}`}>
                    {getRoleIcon(role.name)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      {role.name}
                    </div>
                    {role.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {role.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1.5 font-medium">
                      {role.permissions?.length || 0} permissions
                    </div>
                  </div>
                </div>
                
                {activeRole?._id === role._id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
