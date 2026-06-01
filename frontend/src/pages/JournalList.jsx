import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JournalList() {
  const { user, isGuruKelas, isGuruKhusus } = useAuth();
  const navigate = useNavigate();
  const [classroomId, setClassroomId] = useState('');
  const [journals, setJournals] = useState([]);
  const [message, setMessage] = useState('');
  const [availableClassrooms, setAvailableClassrooms] = useState([]);

  useEffect(() => {
    if (isGuruKelas()) {
      if (user?.classroomId) {
        setClassroomId(user.classroomId);
      } else {
        setMessage('Anda belum ditugaskan ke kelas manapun.');
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
            setClassroomId(assignedClasses[0].id);
          } else {
            setMessage('Anda belum ditugaskan ke kelas manapun.');
          }
        } catch(err) {
          console.error(err);
          setMessage('Gagal memuat daftar kelas.');
        }
      };
      fetchClasses();
    }
  }, [user, isGuruKelas, isGuruKhusus]);

  const fetchJournals = async () => {
    if (!classroomId) return;
    try {
      setMessage('Memuat...');
      const res = await axios.get(`http://localhost:8080/api/journals/class/${classroomId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setJournals(res.data.data);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Gagal memuat jurnal. Pastikan data valid.');
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchJournals();
    }
  }, [classroomId]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Jurnal Harian Guru</h2>
          <p className="text-slate-500 text-sm mt-1">Catatan harian kegiatan belajar mengajar</p>
        </div>
        <button 
          onClick={() => navigate('/jurnal/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Buat Jurnal
        </button>
      </div>

      {isGuruKhusus() && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Kelas</label>
          <div className="flex gap-4">
            <select 
              value={classroomId} 
              onChange={e => setClassroomId(e.target.value)} 
              className="flex-1 max-w-md bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 transition-colors"
            >
              {availableClassrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {message && <p className="text-sm text-blue-600 mt-2 font-medium">{message}</p>}
        </div>
      )}

      {isGuruKelas() && message && (
        <div className="mb-6">
          <p className="text-sm text-blue-600 font-medium">{message}</p>
        </div>
      )}

      <div className="grid gap-4">
        {journals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
            {classroomId ? 'Belum ada jurnal untuk kelas ini.' : 'Masukkan ID Kelas untuk melihat jurnal.'}
          </div>
        ) : (
          journals.map(j => (
            <div key={j.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {j.date}
                </span>
                <span className="text-sm font-semibold text-slate-500">Guru: {j.teacherName}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{j.topic}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{j.learningObjective}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{j.activities}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluasi</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm italic">{j.evaluationSummary}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
