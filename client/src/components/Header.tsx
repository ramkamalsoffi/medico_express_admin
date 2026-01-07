import { Search, Plus, Bell, Settings } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Welcome Message */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="flex flex-col">
                <span className="text-cyan-600 font-bold text-sm leading-tight">WEBNCX</span>
                <span className="text-gray-600 text-xs leading-tight">TECHNOLOGIES</span>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-gray-700 font-medium">
              Welcome to <span className="font-semibold">Inventory Management System!</span>
            </div>
          </div>

          {/* Right Side - Search, Actions, and Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Icons */}
            <button className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-5 h-5 text-white" />
            </button>

            {/* Notification Bell with Badge */}
            <button className="relative w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Settings */}
            <button className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>

            {/* User Profile Dropdown */}
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;



