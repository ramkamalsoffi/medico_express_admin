import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  User,
  Truck,
  Factory,
  Users,
  Stethoscope,
  Package,
  UserCircle,
  FileSpreadsheet,
  FolderOpen,
  FileText,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  subItems?: { label: string; path: string }[];
}

const dashboardItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
];

const widgetItems: SidebarItem[] = [
  {
    icon: Briefcase,
    label: 'Business',
    path: '/business',
    subItems: [
      { label: 'Purchase', path: '/business/purchase' },
      { label: 'Sales', path: '/business/sales' },
      { label: 'Stock', path: '/business/stock' },
    ]
  },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Truck, label: 'Supplier', path: '/supplier' },
  { icon: Factory, label: 'Manufacturer', path: '/manufacturer' },
  { icon: Users, label: 'Customer', path: '/customer' },
  { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
  { icon: Package, label: 'Product', path: '/product' },
  { icon: UserCircle, label: 'Employee', path: '/employee' },
  {
    icon: FileSpreadsheet,
    label: 'AC Master Creation',
    path: '/ac-master',
    subItems: [
      { label: 'Adjustment Entry', path: '/ac-master/adjustment-entry' },
      { label: 'Receipts', path: '/ac-master/receipts' },
      { label: 'Payments', path: '/ac-master/payments' },
    ]
  },
  {
    icon: FolderOpen,
    label: 'Master Creation',
    path: '/master-creation',
    subItems: [
      { label: 'Packing Creation', path: '/master-creation/packing' },
      { label: 'Molecule Creation', path: '/master-creation/molecule' },
      { label: 'HSN Creation', path: '/master-creation/hsn' },
      { label: 'Category Creation', path: '/master-creation/category' },
      { label: 'Sub-Category Creation', path: '/master-creation/sub-category' },
    ]
  },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: ShoppingCart, label: 'E-com', path: '/ecom' },
];

function Sidebar() {
  const location = useLocation();
  const { user, isProfileLoading, logout } = useAuth();

  // Get user display info
  const displayName = user?.employee?.name || user?.username || 'User';
  const userRole = user?.employee?.designation || user?.role || 'Employee';

  // Auto-expand parent menus based on current route
  const getInitialExpandedMenus = () => {
    const expanded = [];

    // Check if we're on a Business sub-page
    if (location.pathname.startsWith('/business/')) {
      expanded.push('Business');
    }

    // Check if we're on an AC Master Creation sub-page
    if (location.pathname.startsWith('/ac-master/')) {
      expanded.push('AC Master Creation');
    }

    // Check if we're on a Master Creation sub-page
    if (location.pathname.startsWith('/master-creation/')) {
      expanded.push('Master Creation');
    }

    return expanded;
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(getInitialExpandedMenus());

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isMenuExpanded = (label: string) => expandedMenus.includes(label);
  const isPathActive = (path: string) => location.pathname === path;
  const isParentActive = (item: SidebarItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  const renderMenuItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const isActive = isPathActive(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = isMenuExpanded(item.label);
    const parentActive = isParentActive(item);

    return (
      <li key={item.path}>
        {hasSubItems ? (
          <>
            <button
              onClick={() => toggleMenu(item.label)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-all group ${parentActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${parentActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {isExpanded && (
              <ul className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => {
                  const isSubActive = isPathActive(subItem.path);
                  return (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all ${isSubActive
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-all group ${isActive
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col sticky top-[64px] overflow-hidden">
      <nav className="p-4 flex-1 overflow-y-auto">
        {/* Dashboard Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">
            Dashboard
          </h3>
          <ul className="space-y-1">
            {dashboardItems.map(renderMenuItem)}
          </ul>
        </div>

        {/* Widgets Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">
            Widgets
          </h3>
          <ul className="space-y-1">
            {widgetItems.map(renderMenuItem)}
          </ul>
        </div>
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-gray-200">
        {isProfileLoading ? (
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* User Info */}
            <Link
              to="/profile"
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`}
                alt={displayName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
