import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek apakah ada data user di localStorage (mock session)
    const storedUser = localStorage.getItem('educonnect_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.token) {
        localStorage.setItem('token', parsedUser.token);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Username atau password salah!');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('educonnect_user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('educonnect_user');
    localStorage.removeItem('token');
  };

  // Helper functions
  const isGuruKelas = () => user?.role === 'GURU' && user?.tipeGuru === 'KELAS';
  const isGuruKhusus = () => user?.role === 'GURU' && user?.tipeGuru === 'KHUSUS';
  const isGuru = () => user?.role === 'GURU';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isGuruKelas, isGuruKhusus, isGuru }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
