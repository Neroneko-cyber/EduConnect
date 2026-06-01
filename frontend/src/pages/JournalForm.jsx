import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function JournalForm() {
  const { user, isGuruKelas, isGuruKhusus } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    classroomId: '',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    learningObjective: '',
    activities: '',
    evaluationSummary: ''
  });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableClassrooms, setAvailableClassrooms] = useState([]);

  useEffect(() => {
    if (isGuruKelas()) {
      if (user?.classroomId) {
        setFormData(prev => ({ ...prev, classroomId: user.classroomId }));
      }
    } else if (isGuruKhusus()) {
      const fetchClasses = async () => {
        try {
          const res = await axios.get('http://localhost:8080/api/classrooms', {
             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const allClasses = res.data.data;
          const assignedClasses = allClasses.filter(c => user?.classrooms?.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name));
          setAvailableClassrooms(assignedClasses);
          if (assignedClasses.length > 0) {
            setFormData(prev => ({ ...prev, classroomId: assignedClasses[0].id }));
          }
        } catch(err) {
          console.error(err);
        }
      };
      fetchClasses();
    }
  }, [user, isGuruKelas, isGuruKhusus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      await axios.post('http://localhost:8080/api/journals', formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setStatus({ type: 'success', message: 'Jurnal berhasil disimpan!' });
      setTimeout(() => navigate('/jurnal'), 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.message || 'Gagal menyimpan jurnal' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-8 shadow-sm border border-[#e2e8f0] dark:border-[#1e293b]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white">Buat Jurnal Harian</h2>
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm">
            Batal
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-xl mb-6 font-semibold border ${status.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isGuruKhusus() && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Pilih Kelas</label>
                <select 
                  name="classroomId" value={formData.classroomId} onChange={handleChange} required
                  className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors"
                >
                  <option value="" disabled>-- Pilih Kelas --</option>
                  {availableClassrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={`flex flex-col gap-2 ${isGuruKelas() ? 'md:col-span-2' : ''}`}>
              <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Tanggal</label>
              <input 
                type="date" name="date" value={formData.date} onChange={handleChange} required
                className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
          </div>

          <Input 
            label="Topik Pembelajaran" 
            name="topic" value={formData.topic} onChange={handleChange} required
            placeholder="Contoh: Aljabar Linear"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Tujuan Pembelajaran</label>
            <textarea 
              rows="2" name="learningObjective" value={formData.learningObjective} onChange={handleChange} required
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Aktivitas</label>
            <textarea 
              rows="3" name="activities" value={formData.activities} onChange={handleChange} required
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Evaluasi / Kesimpulan</label>
            <textarea 
              rows="2" name="evaluationSummary" value={formData.evaluationSummary} onChange={handleChange} required
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
            />
          </div>
          
          <Button type="submit" isLoading={isLoading} className="mt-4">
            Simpan Jurnal
          </Button>
        </form>
      </div>
    </div>
  );
}
