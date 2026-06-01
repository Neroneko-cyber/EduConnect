import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  Megaphone,
  X,
  Send
} from 'lucide-react';

const Home = () => {
  const { user, isGuru } = useAuth();
  
  if (!user) return null;

  if (isGuru && isGuru()) {
    return <GuruDashboard />;
  }

  return <DefaultDashboard user={user} />;
};

const GuruDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ accepted: 0, inProgress: 0 });
  const [chartData, setChartData] = useState([]);
  const [journals, setJournals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headmasters, setHeadmasters] = useState([]);
  
  // Form State
  const [form, setForm] = useState({
    category: 'IZIN',
    subject: '',
    description: '',
    receiverId: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    // Fetch Stats
    fetch(`http://localhost:8080/api/dispositions/sender/${user.id}/stats`, { headers })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    // Fetch Chart Data (if Guru Kelas)
    if (user.classroomId) {
      fetch(`http://localhost:8080/api/grades/aggregation/${user.classroomId}?academicYear=2026-2027&semester=Ganjil`, { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map(d => ({
              name: d.subject,
              Terbaik: d.maxScore || 0,
              RataRata: d.avgScore ? parseFloat(d.avgScore.toFixed(2)) : 0,
              Terendah: d.minScore || 0
            }));
            setChartData(formatted);
          }
        })
        .catch(err => console.error(err));

      // Fetch Journals
      fetch(`http://localhost:8080/api/journals/class/${user.classroomId}`, { headers })
        .then(res => res.json())
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setJournals(res.data);
          }
        })
        .catch(err => console.error(err));
    }

    // Fetch Headmaster for disposition target
    fetch(`http://localhost:8080/api/users`, { headers })
      .then(res => res.json())
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          const ks = res.data.filter(u => u.role === 'KEPALA_SEKOLAH');
          setHeadmasters(ks);
          if (ks.length > 0) {
            setForm(prev => ({ ...prev, receiverId: ks[0].id }));
          }
        }
      })
      .catch(err => console.error(err));

  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.receiverId) {
      alert("Kepala Sekolah tidak ditemukan di sistem.");
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/dispositions`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        senderId: user.id
      })
    })
    .then(res => {
      if (res.ok) {
        alert("Pengajuan berhasil dikirim.");
        setIsModalOpen(false);
        // refresh stats
        fetch(`http://localhost:8080/api/dispositions/sender/${user.id}/stats`, { 
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setStats(data));
      } else {
        alert("Gagal mengirim pengajuan.");
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Guru</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selamat datang, {user.name}. ({user.tipeGuru === 'KELAS' ? 'Guru Kelas' : 'Guru Khusus'})</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Kiri - Buat Pengajuan */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 shadow-lg shadow-rose-500/30 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md mb-4">
              <FileText size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold">Pengajuan ke Kepala Sekolah</h3>
            <p className="text-rose-100 text-sm mt-1">Izin, Perbaikan, Dokumen, dll.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 flex items-center justify-center gap-2 bg-white text-rose-600 font-bold py-2.5 px-4 rounded-xl hover:bg-rose-50 transition-colors w-full"
          >
            <Plus size={18} /> Buat Pengajuan
          </button>
        </div>

        {/* Card Tengah - Diterima */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/30 flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-emerald-100 font-medium mb-1">Pengajuan Diterima</p>
            <h3 className="text-4xl font-bold">{stats.accepted}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md relative z-10">
            <CheckCircle2 size={28} className="text-white" />
          </div>
        </div>

        {/* Card Kanan - Diproses */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg shadow-amber-500/30 flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-amber-50 font-medium mb-1">Pengajuan Diproses</p>
            <h3 className="text-4xl font-bold">{stats.inProgress}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md relative z-10">
            <Clock size={28} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Chart */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Grafik Nilai Kelas {user.classroomId ? '' : '(Silakan pilih kelas di Penilaian)'}</h3>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Terbaik" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="RataRata" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Terendah" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Data nilai belum tersedia.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Jurnal Harian */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Jurnal Harian</h3>
            <Link to="/jurnal" className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {journals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <FileText size={32} opacity={0.5} />
                <p className="text-sm">Belum ada jurnal hari ini.</p>
              </div>
            ) : (
              journals.map((j) => (
                <div key={j.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{j.topic}</h4>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{j.subject}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{j.activities}</p>
                </div>
              ))
            )}
          </div>
          
          <Link to="/jurnal" className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Buat Jurnal
          </Link>
        </div>
      </div>

      {/* Modal Pengajuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send size={18} className="text-blue-600" />
                Buat Pengajuan
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  required
                >
                  <option value="IZIN">Izin Mengajar</option>
                  <option value="PERBAIKAN_KELAS">Perbaikan Fasilitas Kelas</option>
                  <option value="ACC_DOKUMEN">Persetujuan Dokumen</option>
                  <option value="SURAT_INSTANSI">Surat Pengantar Instansi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subjek Pengajuan</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Izin Sakit 2 Hari"
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi / Alasan</label>
                <textarea 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 custom-scrollbar"
                  placeholder="Jelaskan detail pengajuan..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  required
                />
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DefaultDashboard = ({ user }) => {
  const [dispositions, setDispositions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch Dispositions
    fetch(`http://localhost:8080/api/dispositions/receiver/${user.id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDispositions(data); })
      .catch(err => console.error(err));

    // Fetch Announcements
    fetch(`http://localhost:8080/api/announcements`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAnnouncements(data); })
      .catch(err => console.error(err));

  }, [user]);

  const totalTasks = dispositions.length;
  const doneTasks = dispositions.filter(d => d.status === 'DONE').length;
  const pendingTasks = dispositions.filter(d => d.status !== 'DONE').length;

  const chartData = [
    { name: 'Jan', Selesai: 40, Proses: 24, Baru: 10 },
    { name: 'Feb', Selesai: 30, Proses: 13, Baru: 22 },
    { name: 'Mar', Selesai: 20, Proses: 38, Baru: 29 },
    { name: 'Apr', Selesai: 27, Proses: 39, Baru: 20 },
    { name: 'Mei', Selesai: Math.max(doneTasks, 18), Proses: Math.max(pendingTasks, 12), Baru: 5 },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau aktivitas dan tugas Anda hari ini.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Pengajuan Dari Guru</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalTasks}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Pengajuan Selesai</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{doneTasks}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Pengajuan dalam proses</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{pendingTasks}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        <div className="xl:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pengumuman Terbaru</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
              <Megaphone size={16} />
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <AlertCircle size={32} opacity={0.5} />
                <p className="text-sm">Belum ada pengumuman.</p>
              </div>
            ) : (
              announcements.slice(0, 6).map((a) => (
                <div key={a.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                    {a.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{a.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 self-center transition-colors" />
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            Lihat Semua Pengumuman
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
