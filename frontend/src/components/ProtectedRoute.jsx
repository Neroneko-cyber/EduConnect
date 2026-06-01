import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="text-xl font-semibold animate-fade-in">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    // Belum login, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Sudah login tapi role tidak sesuai, arahkan ke halaman utama dashboard
    return <Navigate to="/" replace />;
  }

  // Jika lolos validasi, render komponen anaknya (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
