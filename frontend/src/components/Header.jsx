import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Simple path to title mapper
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/disposisi/create': return 'Buat Disposisi';
      case '/monitoring': return 'Monitoring Sekolah';
      case '/laporan': return 'Laporan Keuangan';
      case '/jadwal': return 'Jadwal Mengajar';
      case '/penilaian': return 'Penilaian Siswa';
      case '/users': return 'Manajemen User';
      case '/spp': return 'Pembayaran SPP';
      case '/assets': return 'Manajemen Sarpras';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-[90px] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        {/* User Info & Logout */}
        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-6">
          <div className="flex flex-col text-right">
            <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{user?.name}</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
          
          <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-lg border border-slate-300 dark:border-slate-700">
            {user?.name?.charAt(0)}
          </div>
          
          <button 
            onClick={logout}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
