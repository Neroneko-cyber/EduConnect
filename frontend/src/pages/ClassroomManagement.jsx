import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Users, UserPlus, Trash2, X, Check } from 'lucide-react';

const ClassroomManagement = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [studentsInClass, setStudentsInClass] = useState([]);
  
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removeReason, setRemoveReason] = useState('DROPOUT');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/classrooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // asumsikan pakai token kalau ada, walau di kode belum di enforce 
        }
      });
      const data = await res.json();
      if (data.data) {
        const sortedData = data.data.sort((a, b) => a.name.localeCompare(b.name));
        setClassrooms(sortedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentsInClass = async (classroomId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/class/${classroomId}`);
      const data = await res.json();
      if (data.data) {
        setStudentsInClass(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnassignedStudents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users/students/unassigned');
      const data = await res.json();
      if (data.data) {
        setUnassignedStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectClassroom = (cls) => {
    setSelectedClassroom(cls);
    fetchStudentsInClass(cls.id);
  };

  const openAddStudentModal = () => {
    setSelectedStudentIds([]);
    fetchUnassignedStudents();
    setIsAddStudentModalOpen(true);
  };

  const toggleStudentSelection = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/classrooms/${selectedClassroom.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedStudentIds)
      });
      if (res.ok) {
        alert("Siswa berhasil ditambahkan!");
        setIsAddStudentModalOpen(false);
        fetchStudentsInClass(selectedClassroom.id);
      } else {
        alert("Gagal menambahkan siswa.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setRemoveReason('DROPOUT');
    setIsRemoveModalOpen(true);
  };

  const handleRemoveStudent = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/classrooms/${selectedClassroom.id}/students/${studentToRemove.id}?reason=${removeReason}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Siswa berhasil dikeluarkan dari kelas.");
        setIsRemoveModalOpen(false);
        fetchStudentsInClass(selectedClassroom.id);
      } else {
        alert("Gagal mengeluarkan siswa.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'TU') {
    return (
      <div className="flex items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-red-500">Akses Ditolak. Halaman khusus Tata Usaha.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[24px] p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <Building2 size={36} className="text-blue-200" />
          <h1 className="text-3xl font-bold">Manajemen Kelas</h1>
        </div>
        <p className="text-blue-100 text-lg">Kelola daftar siswa yang terdaftar di masing-masing kelas secara efisien.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Daftar Kelas */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b] shadow-sm">
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-white mb-4">Daftar Kelas</h2>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
            {classrooms.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleSelectClassroom(cls)}
                className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center group
                  ${selectedClassroom?.id === cls.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
              >
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">{cls.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat: {cls.gradeClass} | Tahun: {cls.academicYear}</p>
                </div>
                <Users size={20} className={selectedClassroom?.id === cls.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'} />
              </button>
            ))}
            {classrooms.length === 0 && <p className="text-sm text-gray-500 text-center">Belum ada kelas.</p>}
          </div>
        </div>

        {/* Kolom Detail Daftar Siswa di Kelas */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b] shadow-sm">
          {selectedClassroom ? (
            <>
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white flex items-center gap-2">
                    {selectedClassroom.name}
                  </h2>
                  <p className="text-sm text-gray-500">Tingkat: {selectedClassroom.gradeClass} | Wali Kelas: {selectedClassroom.homeroomTeacher?.name || 'Belum di-assign'}</p>
                </div>
                <button 
                  onClick={openAddStudentModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <UserPlus size={18} />
                  Tambah Siswa
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">No</th>
                      <th className="px-6 py-4">NISN</th>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4 rounded-tr-lg text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInClass.map((student, idx) => (
                      <tr key={student.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-6 py-4">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{student.identityNumber}</td>
                        <td className="px-6 py-4">{student.name}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openRemoveModal(student)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                            title="Keluarkan dari Kelas"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {studentsInClass.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada siswa di kelas ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
              <Users size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Pilih kelas di sebelah kiri untuk melihat daftar siswa</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Siswa */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h2 className="text-xl font-bold text-[#0f172a] dark:text-white flex items-center gap-2">
                <UserPlus className="text-blue-500" />
                Tambah Siswa ke {selectedClassroom?.name}
              </h2>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Pilih siswa yang berstatus UNASSIGNED (Siswa Baru / Pindahan) untuk dimasukkan ke dalam kelas ini.
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">
                        {/* Bisa tambah select all checkbox di sini */}
                        ✓
                      </th>
                      <th className="px-4 py-3">NISN</th>
                      <th className="px-4 py-3">Nama Lengkap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedStudents.map(student => (
                      <tr 
                        key={student.id} 
                        onClick={() => toggleStudentSelection(student.id)}
                        className={`cursor-pointer border-t border-gray-100 dark:border-gray-800 transition
                          ${selectedStudentIds.includes(student.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      >
                        <td className="px-4 py-3 text-center">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border mx-auto transition-colors
                            ${selectedStudentIds.includes(student.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedStudentIds.includes(student.id) && <Check size={14} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.identityNumber}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{student.name}</td>
                      </tr>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500">Tidak ada siswa berstatus UNASSIGNED saat ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {selectedStudentIds.length} Siswa Terpilih
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleBulkAssign}
                  disabled={selectedStudentIds.length === 0 || isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Simpan ke Kelas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Keluarkan Siswa */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Keluarkan Siswa</h2>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Anda akan mengeluarkan <strong>{studentToRemove?.name}</strong> dari kelas <strong>{selectedClassroom?.name}</strong>. Silakan pilih alasan pengeluaran siswa ini:
              </p>

              <div className="flex flex-col gap-3 mb-6">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition
                  ${removeReason === 'DROPOUT' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input 
                    type="radio" 
                    name="reason" 
                    value="DROPOUT"
                    checked={removeReason === 'DROPOUT'}
                    onChange={() => setRemoveReason('DROPOUT')}
                    className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">Dropout (Putus Sekolah)</span>
                    <span className="block text-xs text-gray-500">Siswa berhenti sekolah dan statusnya akan diubah menjadi DROPOUT.</span>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition
                  ${removeReason === 'TRANSFERRED' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input 
                    type="radio" 
                    name="reason" 
                    value="TRANSFERRED"
                    checked={removeReason === 'TRANSFERRED'}
                    onChange={() => setRemoveReason('TRANSFERRED')}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <div>
                    <span className="block font-bold text-gray-900 dark:text-white">Pindah Sekolah</span>
                    <span className="block text-xs text-gray-500">Siswa mutasi ke sekolah lain, status akan diubah menjadi TRANSFERRED.</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsRemoveModalOpen(false)} 
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleRemoveStudent}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition shadow-lg shadow-red-500/20"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;
