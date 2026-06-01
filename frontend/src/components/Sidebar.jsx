import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Eye, 
  BarChart3, 
  CheckSquare, 
  Calendar, 
  FileEdit, 
  Building2, 
  Users, 
  CreditCard, 
  Package,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, isGuruKelas } = useAuth();
  
  if (!user) return null;

  // Render menu berdasarkan role pengguna
  const getMenuByRole = (role) => {
    const commonMenus = [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }
    ];

    switch (role) {
      case 'KEPALA_SEKOLAH':
        return [
          ...commonMenus,
          { path: '/monitoring', label: 'Monitoring Sekolah', icon: <Eye size={20} /> },
          { path: '/laporan', label: 'Laporan Keuangan', icon: <BarChart3 size={20} /> },
          { path: '/assets', label: 'Persetujuan Sarpras', icon: <CheckSquare size={20} /> },
        ];
      case 'GURU':
        const guruMenus = [
          ...commonMenus,
          { path: '/jadwal', label: 'Jadwal Mengajar', icon: <Calendar size={20} /> },
          { path: '/penilaian', label: 'Penilaian Siswa', icon: <FileEdit size={20} /> },
        ];
        
        if (isGuruKelas && isGuruKelas()) {
           guruMenus.push({ path: '/raport', label: 'Raport', icon: <FileText size={20} /> });
        }
        
        guruMenus.push(
          { path: '/jurnal', label: 'Jurnal Harian', icon: <CheckSquare size={20} /> },
          { path: '/assets', label: 'Sarpras & Inventaris', icon: <Building2 size={20} /> }
        );
        return guruMenus;
      case 'TU':
        return [
          ...commonMenus,
          { path: '/classrooms', label: 'Manajemen Kelas', icon: <Building2 size={20} /> },
          { path: '/users', label: 'Manajemen User', icon: <Users size={20} /> },
          { path: '/spp', label: 'Pembayaran SPP', icon: <CreditCard size={20} /> },
          { path: '/assets', label: 'Dashboard Sarpras', icon: <Package size={20} /> }
        ];
      default:
        return commonMenus;
    }
  };

  const menuItems = getMenuByRole(user.role);

  return (
    <aside className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 shadow-2xl">
      <div className="p-8 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
            E
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Edu<span className="text-blue-500">Connect</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((menu, idx) => (
          <NavLink
            key={idx}
            to={menu.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600/10 text-blue-500 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-8 before:bg-blue-500 before:rounded-r-full' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }
            `}
          >
            <span className={`transition-colors ${'group-hover:text-blue-400'}`}>{menu.icon}</span>
            {menu.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-slate-800/60">
        <div className="bg-slate-800/40 rounded-2xl p-5 flex flex-col gap-1.5 items-center text-center border border-slate-700/50">
          <span className="text-sm font-semibold text-slate-300">Sistem Akademik</span>
          <span className="text-xs font-medium text-slate-500">Versi 2.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
