import React, { useState, useEffect, useRef } from 'react';
import { DataGrid, renderTextEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AverageCalculatorModal from '../components/AverageCalculatorModal';
import { Calculator } from 'lucide-react';

const SUBJECTS_WAJIB = ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Daerah', 'Matematika', 'PKN', 'IPS', 'IPA'];

export default function GradeSpreadsheet() {
  const { user, isGuruKelas, isGuruKhusus } = useAuth();
  
  const [classroomId, setClassroomId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('Ganjil');
  const [message, setMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState(SUBJECTS_WAJIB[0]);
  const [rows, setRows] = useState([]);
  
  // Calculator Modal state
  const [calcModal, setCalcModal] = useState({ isOpen: false, rowId: null, field: null, title: '' });

  const timerRef = useRef(null);

  const [availableClassrooms, setAvailableClassrooms] = useState([]);

  // Initialize state based on role
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/classrooms', {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const allClasses = res.data.data;
        
        if (isGuruKelas()) {
           const myClass = allClasses.find(c => c.id === user.classroomId);
           setAvailableClassrooms(myClass ? [myClass] : []);
           setClassroomId(user.classroomId || '');
        } else if (isGuruKhusus()) {
           const assignedClasses = allClasses.filter(c => user?.classrooms?.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name));
           setAvailableClassrooms(assignedClasses);
           if (assignedClasses.length > 0) {
             setClassroomId(assignedClasses[0].id);
           }
           setActiveTab(user.specialSubject || 'Umum');
        }
      } catch(err) {
        console.error(err);
      }
    };
    
    if (user) {
      fetchClasses();
    }
  }, [user, isGuruKelas, isGuruKhusus]);

  useEffect(() => {
    if (classroomId) {
      fetchGrades();
    }
  }, [classroomId, academicYear, semester, activeTab]);

  const fetchGrades = async () => {
    try {
      setMessage('Memuat...');
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const studentsRes = await axios.get(`http://localhost:8080/api/users/class/${classroomId}`, { headers });
      const students = studentsRes.data.data;

      // Fetch grades for specific subject
      const gradesRes = await axios.get(`http://localhost:8080/api/grades/class/${classroomId}/subject`, {
        params: { academicYear, semester, subject: activeTab },
        headers
      });
      const grades = gradesRes.data;

      const mergedRows = students.map(student => {
        const existingGrade = grades.find(g => g.studentId === student.id);
        if (existingGrade) {
          return { ...existingGrade, studentName: student.name };
        }
        return {
          id: null,
          studentId: student.id,
          studentName: student.name,
          subject: activeTab,
          academicYear,
          semester,
          taskScore: 0,
          examScore: 0,
          utsScore: 0,
          uasScore: 0,
          finalScore: 0,
          reportScore: 0,
          attitudeScore: 0,
          attitudeLabel: '-'
        };
      });

      setRows(mergedRows);
      setMessage('Data dimuat');
    } catch (err) {
      console.error(err);
      setMessage('Gagal memuat data nilai.');
    }
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
    
    // Auto-save logic (debounce 1s)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveGrades(newRows);
    }, 1000);
  };

  const saveGrades = async (currentRows) => {
    try {
      setMessage('Menyimpan...');
      await axios.patch('http://localhost:8080/api/grades/bulk', {
        classroomId,
        academicYear,
        semester,
        grades: currentRows.map(r => ({
          ...r,
          taskScore: parseFloat(r.taskScore) || 0,
          examScore: parseFloat(r.examScore) || 0,
          utsScore: parseFloat(r.utsScore) || 0,
          uasScore: parseFloat(r.uasScore) || 0,
          attitudeScore: parseFloat(r.attitudeScore) || 0
        }))
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setMessage('Tersimpan otomatis');
      fetchGrades(); // Refresh untuk mendapatkan kalkulasi akhir & badge sikap
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data || 'Gagal menyimpan data (Cek Akses)');
    }
  };

  // Custom Cell Formatters
  const scoreFormatter = (props) => {
    return (
      <div className="flex justify-between items-center w-full h-full">
        <span>{props.row[props.column.key]}</span>
        <button 
          onClick={() => setCalcModal({ 
            isOpen: true, 
            rowId: props.row.studentId, 
            field: props.column.key, 
            title: `Hitung Rata-rata ${props.column.name}` 
          })}
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Calculator size={16} />
        </button>
      </div>
    );
  };

  const attitudeFormatter = (props) => {
    const label = props.row.attitudeLabel;
    let colorClass = 'bg-slate-100 text-slate-700';
    if (label === 'Sangat Baik') colorClass = 'bg-emerald-100 text-emerald-700';
    else if (label === 'Baik') colorClass = 'bg-blue-100 text-blue-700';
    else if (label === 'Cukup') colorClass = 'bg-amber-100 text-amber-700';
    else if (label === 'Kurang') colorClass = 'bg-rose-100 text-rose-700';
    
    return (
      <div className="flex items-center gap-2 h-full">
        <span className="font-semibold">{props.row.attitudeScore}</span>
        {label !== '-' && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
            {label}
          </span>
        )}
      </div>
    );
  };

  const isReadOnly = (isGuruKhusus() && activeTab !== user.specialSubject) || 
                     (isGuruKelas() && !SUBJECTS_WAJIB.includes(activeTab) && activeTab !== 'Agama' && activeTab !== 'Kesenian' && activeTab !== 'Olahraga');

  const columns = [
    { key: 'studentId', name: 'ID Siswa', width: 200 },
    { key: 'studentName', name: 'Nama Siswa', width: 200, editable: false },
    { key: 'taskScore', name: 'Nilai Tugas', renderEditCell: isReadOnly ? undefined : renderTextEditor, renderCell: isReadOnly ? undefined : scoreFormatter },
    { key: 'examScore', name: 'Nilai Ulangan', renderEditCell: isReadOnly ? undefined : renderTextEditor, renderCell: isReadOnly ? undefined : scoreFormatter },
    { key: 'utsScore', name: 'Nilai UTS', renderEditCell: isReadOnly ? undefined : renderTextEditor },
    { key: 'uasScore', name: 'Nilai UAS', renderEditCell: isReadOnly ? undefined : renderTextEditor },
    { key: 'finalScore', name: 'Nilai Akhir', editable: false },
    { key: 'reportScore', name: 'Nilai Raport', editable: false },
    { key: 'attitudeScore', name: 'Sikap (1-5)', renderEditCell: isReadOnly ? undefined : renderTextEditor, renderCell: attitudeFormatter, width: 150 },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Penilaian Siswa</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Kelas</label>
          {isGuruKelas() ? (
            <input 
              type="text" 
              value={availableClassrooms.length > 0 ? availableClassrooms[0].name : classroomId} 
              disabled 
              className="border p-2 rounded w-80 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500"
            />
          ) : (
            <select 
              value={classroomId} 
              onChange={e => setClassroomId(e.target.value)} 
              className="border p-2 rounded w-80 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {availableClassrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tahun Ajaran</label>
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white">
            <option value="2026-2027">2026-2027</option>
            <option value="2027-2028">2027-2028</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Semester</label>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white">
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>
      
      {/* Tabs Mapel */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto custom-scrollbar">
        {isGuruKelas() && SUBJECTS_WAJIB.map(subject => (
          <button
            key={subject}
            onClick={() => setActiveTab(subject)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === subject 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {subject}
          </button>
        ))}
        {/* Guru Khusus hanya lihat tab miliknya */}
        {isGuruKhusus() && (
          <button
            onClick={() => setActiveTab(user.specialSubject)}
            className="px-4 py-2 font-semibold text-sm border-b-2 border-blue-600 text-blue-600 whitespace-nowrap"
          >
            {user.specialSubject} (Khusus)
          </button>
        )}
        {/* Guru Kelas bisa melihat tab Guru Khusus (read-only) */}
        {isGuruKelas() && ['Agama', 'Kesenian', 'Olahraga'].map(subject => (
          <button
            key={subject}
            onClick={() => setActiveTab(subject)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === subject 
                ? 'border-indigo-500 text-indigo-500' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {subject} <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">R/O</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className={`text-sm font-semibold ${isReadOnly ? 'text-amber-600' : 'text-blue-600'}`}>
          {isReadOnly ? 'Mode Baca Saja (Hanya Guru Khusus terkait yang dapat mengubah)' : message}
        </span>
      </div>

      <div style={{ height: 400, width: '100%' }} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
        <DataGrid 
          columns={columns} 
          rows={rows} 
          onRowsChange={isReadOnly ? undefined : handleRowsChange} 
          className="h-full w-full rdg-light"
        />
      </div>

      <AverageCalculatorModal 
        isOpen={calcModal.isOpen}
        title={calcModal.title}
        onClose={() => setCalcModal({ ...calcModal, isOpen: false })}
        onApply={(average) => {
          const newRows = rows.map(r => 
            r.studentId === calcModal.rowId ? { ...r, [calcModal.field]: average } : r
          );
          handleRowsChange(newRows);
        }}
      />
    </div>
  );
}
