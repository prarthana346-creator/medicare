import React from 'react';
import { Menu, Bell, Shield, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date / Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-medicare-600" />
          <span className="font-medium text-slate-700">{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <button
          onClick={() => navigate('/appointments')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-medicare-700 bg-medicare-50 hover:bg-medicare-100 border border-medicare-200 rounded-lg transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-medicare-600" />
          <span>Book Appointment</span>
        </button>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="hidden sm:inline">Hospital System Online</span>
          <span className="sm:hidden">Online</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-medicare-600 to-medicare-400 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.username || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

