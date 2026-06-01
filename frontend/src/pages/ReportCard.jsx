import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Printer, Download } from 'lucide-react';

const SUBJECTS_ORDER = ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Daerah', 'Matematika', 'PKN', 'IPS', 'IPA', 'Agama', 'Kesenian', 'Olahraga'];

export default function ReportCard() {
  const { user, isGuruKelas } = useAuth();
  
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('Ganjil');
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isGuruKelas() && user.classroomId) {
      fetchReportCards();
    }
  }, [user, academicYear, semester]);

  const fetchReportCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const res = await axios.get(`http://localhost:8080/api/grades/report-card/${user.classroomId}`, {
        params: { academicYear, semester },
        headers
      });
      
      setReportCards(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data raport.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isGuruKelas()) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 font-semibold">
          Akses Ditolak. Halaman ini khusus untuk Guru Kelas.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-20">
      <div className="flex justify-between items-end mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rekapitulasi Raport Kelas</h2>
          <p className="text-sm text-slate-500 mt-1">Akumulasi nilai seluruh mata pelajaran (Wajib & Khusus).</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl shadow transition-all"
        >
          <Printer size={18} /> Cetak Raport
        </button>
      </div>

      <div className="flex gap-4 mb-6 print:hidden bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tahun Ajaran</label>
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="border p-2 rounded-lg bg-slate-50 border-slate-200 text-sm font-semibold">
            <option value="2026-2027">2026-2027</option>
            <option value="2027-2028">2027-2028</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="border p-2 rounded-lg bg-slate-50 border-slate-200 text-sm font-semibold">
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 font-bold text-slate-400">Memuat data raport...</div>
      ) : error ? (
        <div className="text-center p-10 font-bold text-rose-500 bg-rose-50 rounded-xl">{error}</div>
      ) : reportCards.length === 0 ? (
        <div className="text-center p-10 font-bold text-slate-400 bg-white rounded-xl shadow-sm">Belum ada siswa di kelas ini.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider">Rekapitulasi Nilai Siswa</h1>
            <h2 className="text-lg font-semibold mt-1">SDN 1 Antigravity</h2>
            <p className="text-sm mt-2">Tahun Ajaran: {academicYear} | Semester: {semester}</p>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-900 text-white print:bg-gray-200 print:text-black">
                  <th className="p-3 text-xs font-bold uppercase tracking-wider border-b border-r border-slate-700 print:border-gray-400 text-center w-12">No</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider border-b border-r border-slate-700 print:border-gray-400 sticky left-0 bg-slate-900 print:bg-gray-200 z-10 w-48">Nama Siswa</th>
                  
                  {SUBJECTS_ORDER.map(subj => (
                    <th key={subj} className="p-3 text-xs font-bold uppercase tracking-wider border-b border-r border-slate-700 print:border-gray-400 text-center w-24">
                      {subj.replace('Bahasa', 'B.')}
                    </th>
                  ))}
                  
                  <th className="p-3 text-xs font-bold uppercase tracking-wider border-b border-r border-slate-700 print:border-gray-400 text-center w-28 bg-blue-600 print:bg-gray-300">Total Nilai</th>
                  <th className="p-3 text-xs font-bold uppercase tracking-wider border-b border-slate-700 print:border-gray-400 text-center w-20 bg-emerald-600 print:bg-gray-300">Ranking</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 print:text-black">
                {reportCards.map((rc, index) => (
                  <tr key={rc.studentId} className="border-b border-slate-200 hover:bg-slate-50 print:border-gray-400 group">
                    <td className="p-3 border-r border-slate-200 print:border-gray-400 text-center font-medium">{index + 1}</td>
                    <td className="p-3 border-r border-slate-200 print:border-gray-400 font-bold sticky left-0 bg-white group-hover:bg-slate-50 z-10">{rc.studentName}</td>
                    
                    {SUBJECTS_ORDER.map(subj => {
                      const scoreData = rc.subjects?.find(s => s.subject === subj);
                      const score = scoreData?.reportScore;
                      return (
                        <td key={subj} className={`p-3 border-r border-slate-200 print:border-gray-400 text-center font-semibold ${!score ? 'text-slate-300' : ''}`}>
                          {score ? parseFloat(score).toFixed(2) : '-'}
                        </td>
                      );
                    })}
                    
                    <td className="p-3 border-r border-slate-200 print:border-gray-400 text-center font-bold text-blue-700 bg-blue-50/50">
                      {rc.totalReportScore ? parseFloat(rc.totalReportScore).toFixed(2) : '-'}
                    </td>
                    <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/50">
                      {rc.ranking}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 150px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
