import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages & Layouts
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import CreateDisposition from './pages/CreateDisposition';
import DispositionList from './pages/DispositionList';
import GradeSpreadsheet from './pages/GradeSpreadsheet';
import ReportCard from './pages/ReportCard';
import JournalList from './pages/JournalList';
import JournalForm from './pages/JournalForm';
import AssetsRouter from './pages/AssetsRouter';
import PlaceholderPage from './pages/PlaceholderPage';
import ClassroomManagement from './pages/ClassroomManagement';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/disposisi" element={<DispositionList />} />
            <Route path="/disposisi/create" element={<CreateDisposition />} />
            
            {/* Dummy routes untuk mengakomodasi menu di Sidebar */}
            <Route path="/monitoring" element={<PlaceholderPage title="Monitoring Sekolah" description="Modul analitik dan monitoring aktivitas sekolah secara real-time sedang dibangun." />} />
            <Route path="/laporan" element={<PlaceholderPage title="Laporan Keuangan" description="Modul integrasi laporan keuangan dan pembukuan otomatis segera hadir." />} />
            <Route path="/jadwal" element={<PlaceholderPage title="Jadwal Mengajar" description="Sistem penjadwalan kelas interaktif sedang dalam tahap konstruksi." />} />
            <Route path="/penilaian" element={<GradeSpreadsheet />} />
            <Route path="/raport" element={<ReportCard />} />
            <Route path="/jurnal" element={<JournalList />} />
            <Route path="/jurnal/create" element={<JournalForm />} />
            <Route path="/users" element={<PlaceholderPage title="Manajemen User" description="Panel administrasi pengguna, guru, dan staf sedang dikembangkan." />} />
            <Route path="/spp" element={<PlaceholderPage title="Pembayaran SPP" description="Sistem pembayaran tagihan sekolah terpadu akan segera tersedia." />} />
            <Route path="/assets" element={<AssetsRouter />} />
            <Route path="/classrooms" element={<ClassroomManagement />} />
          </Route>
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
