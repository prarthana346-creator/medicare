import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarClock,
  ClipboardList,
  CreditCard,
  LogOut,
  Activity,
  HeartPulse,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Doctors', href: '/doctors', icon: UserCheck },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Appointments', href: '/appointments', icon: CalendarClock },
  { name: 'Medical Records', href: '/medical-records', icon: ClipboardList },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-gradient-to-r from-medicare-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medicare-600 flex items-center justify-center text-white shadow-md shadow-medicare-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                MEDI<span className="text-medicare-600">CARE</span>
              </span>
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Hospital System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Main Menu
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-medicare-50 text-medicare-700 font-semibold shadow-sm border border-medicare-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-medicare-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-4 bg-medicare-600 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick System Badge */}
        <div className="p-4 mx-3 mb-3 bg-medicare-50/70 border border-medicare-100 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700">Medicare 24/7 Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Emergency Desk: Ext. 911<br />
            Server Status: Connected
          </p>
        </div>

        {/* User Footer with Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-medicare-100 text-medicare-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.username || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@medicare.com'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

