import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User as UserIcon, LogOut, ChevronDown, Mail, Phone, Building, Briefcase, Key } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isProfileLoading } = useAuth();

  // Get user display info
  const displayName = user?.employee?.name || user?.username || 'User';
  const userRole = user?.employee?.designation || user?.role || 'Employee';
  const userEmail = user?.employee?.email || 'N/A';
  const userPhone = user?.employee?.phone || 'N/A';
  const branchName = user?.employee?.branch?.name || 'N/A';
  const departmentName = user?.employee?.department?.name || 'N/A';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    setIsChangePasswordOpen(true);
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors py-2 pr-2"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`}
          alt={displayName}
          className="w-9 h-9 rounded-full"
        />
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900">{displayName}</span>
          <span className="text-xs text-gray-500">{userRole}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=64`}
                alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                <p className="text-sm text-gray-600">{userRole}</p>
                <p className="text-xs text-gray-500 mt-1">@{user?.username}</p>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">{userPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Branch</p>
                <p className="text-gray-900 font-medium">{branchName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-gray-900 font-medium">{departmentName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile page if needed
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              View Profile
            </button>

            <button
              onClick={handleChangePassword}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default UserProfileDropdown;
