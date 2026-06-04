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


            <Route path="/penilaian" element={<GradeSpreadsheet />} />
            <Route path="/raport" element={<ReportCard />} />
            <Route path="/jurnal" element={<JournalList />} />
            <Route path="/jurnal/create" element={<JournalForm />} />

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
