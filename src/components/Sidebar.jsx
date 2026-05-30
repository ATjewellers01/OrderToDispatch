import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Settings,
  LogOut as LogOutIcon,
  X,
  Users,
  Database,
  ClipboardList,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  ShoppingCart,
  FilePlus2,
  Search,
  Pencil,
  LayoutGrid,
  FilePlus,
  ClipboardCheck,
  Tags,
  Cpu,
  HelpCircle,
  TrendingUp,
  UserCheck,
  History,
  PackageSearch,
  Truck,
  Package,
  CreditCard,
  Ban,
  Warehouse,
  Coins,
  Receipt,
  Blocks,
  Hammer,
  Paintbrush,
  Palette,
  Sparkles,
  Gem,
  Circle,
  Zap,
  BadgeCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import loginLogo from '../Assets/loginlogo.svg';
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const adminMenuItems = [
    { path: '/dashboard',           icon: TrendingUp,     label: 'On Time Delivery' },

    { path: '/order-history',       icon: History,        label: 'Order Management' },
    { path: '/metal-issue',         icon: Coins,          label: 'Metal Issue' },
    { path: '/follow-up',           icon: ClipboardList,  label: 'Follow Up' },
    { path: '/qc1',                 icon: ShieldCheck,    label: 'QC1' },
    { path: '/ghat-jama',           icon: Hammer,         label: 'Ghat Jama' },
    { path: '/meena-inhouse',       icon: Paintbrush,     label: 'Meena Inhouse' },
    { path: '/meena-outside',       icon: Palette,        label: 'Meena Outside' },
    { path: '/polish-inhouse',      icon: Sparkles,       label: 'Polish Inhouse' },
    { path: '/polish-outside',      icon: Gem,            label: 'Polish Outside' },
    { path: '/bangle-polish',       icon: Circle,         label: 'Bangle Polish' },
    { path: '/e-polish',            icon: Zap,            label: 'E-Polish' },
    { path: '/qc2',                 icon: BadgeCheck,     label: 'QC2' },
    { path: '/dispatch',            icon: Truck,          label: 'Dispatch' },
    { path: '/receipt',             icon: CheckCircle,    label: 'Receipt' },
    { path: '/qc3',                 icon: CheckSquare,    label: 'QC3' },
    { path: '/huid-label',          icon: Tags,           label: 'Huid/Label' },
    { path: '/receive-in-stock',    icon: Warehouse,      label: 'Receive In Stock' },
    { path: '/delivery',            icon: Package,        label: 'Delivery' },
    { path: '/master',              icon: LayoutGrid,     label: 'Master' },
    { path: '/settings',            icon: Settings,       label: 'Settings' },
  ];

  const employeeMenuItems = [

    { path: '/order-history', icon: History,       label: 'Order Management' },
    { path: '/metal-issue',   icon: Coins,         label: 'Metal Issue' },
    { path: '/follow-up',     icon: ClipboardList, label: 'Follow Up' },
    { path: '/qc1',           icon: ShieldCheck,   label: 'QC1' },
    { path: '/ghat-jama',     icon: Hammer,        label: 'Ghat Jama' },
    { path: '/meena-inhouse', icon: Paintbrush,    label: 'Meena Inhouse' },
    { path: '/meena-outside', icon: Palette,       label: 'Meena Outside' },
    { path: '/polish-inhouse', icon: Sparkles,     label: 'Polish Inhouse' },
    { path: '/polish-outside', icon: Gem,          label: 'Polish Outside' },
    { path: '/bangle-polish',  icon: Circle,       label: 'Bangle Polish' },
    { path: '/e-polish',       icon: Zap,          label: 'E-Polish' },
    { path: '/qc2',            icon: BadgeCheck,   label: 'QC2' },
    { path: '/dispatch',       icon: Truck,        label: 'Dispatch' },
    { path: '/receipt',        icon: CheckCircle,  label: 'Receipt' },
    { path: '/qc3',            icon: CheckSquare,  label: 'QC3' },
    { path: '/huid-label',     icon: Tags,         label: 'Huid/Label' },
    { path: '/receive-in-stock',icon: Warehouse,    label: 'Receive In Stock' },
    { path: '/delivery',       icon: Package,      label: 'Delivery' },
    { path: '/master',        icon: LayoutGrid,    label: 'Master' },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 sm:w-72 lg:w-56 2xl:w-60 bg-white border-r border-amber-100 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="py-2 px-3 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src={loginLogo} alt="Logo" className="w-full h-full object-contain scale-110" />
              </div>
              <span className="text-[22px] font-bold text-amber-600 tracking-tight leading-tight">Jewel Factory</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-amber-100/50 rounded-lg">
              <X size={20} className="text-amber-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {menuItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.isNested ? (
                  <div className="space-y-1">
                    <button
                      onClick={item.onToggle}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group hover:bg-amber-100/50 hover:text-amber-600 border-l-4 border-transparent`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="font-medium leading-tight whitespace-nowrap">{item.label}</span>
                      </div>
                      {item.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {item.isOpen && (
                      <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                              flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200
                              ${isActive 
                                ? 'bg-amber-100/50 text-amber-600' 
                                : 'text-gray-600 hover:bg-amber-50/50 hover:text-amber-600'}
                            `}
                          >
                            <span className="text-sm leading-tight whitespace-nowrap font-black">{sub.label}</span>
                            {sub.count > 0 && (
                              <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                {sub.count}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-amber-100/50 text-amber-600 border-l-4 border-amber-600' 
                        : 'text-gray-700 hover:bg-amber-50/50 hover:text-amber-600 border-l-4 border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="font-black leading-tight whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-amber-100 bg-amber-50/50">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all font-semibold shadow-sm"
            >
              <LogOutIcon size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;