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
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
          ${getRoleColor(activeRole?.name || '')}
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        {getRoleIcon(activeRole?.name || '')}
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium opacity-70">Active Role</span>
          <span className="text-sm font-bold">{activeRole?.name || 'Select Role'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-2 bg-gray-50 border-b">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Switch Role
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {availableRoles.map((role) => (
              <button
                key={role._id}
                onClick={() => handleRoleSwitch(role._id)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between gap-3
                  hover:bg-gray-50 transition-colors text-left
                  ${activeRole?._id === role._id ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getRoleColor(role.name)}`}>
                    {getRoleIcon(role.name)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">
                      {role.name}
                    </div>
                    {role.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {role.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {role.permissions?.length || 0} permissions
                    </div>
                  </div>
                </div>
                
                {activeRole?._id === role._id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
