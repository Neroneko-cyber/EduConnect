import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, User, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1 data
  const [email, setEmail] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [username, setUsername] = useState('');
  
  // Step 2 data
  const [otp, setOtp] = useState('');
  
  // Step 3 data
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !identityNumber || !username) {
      setError('Semua field harus diisi.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, identityNumber, username })
      });
      const data = await res.text();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data || 'Terjadi kesalahan.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Kode OTP harus diisi.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.text();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data || 'OTP tidak valid.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Password harus diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.text();
      if (res.ok) {
        setStep(4);
      } else {
        setError(data || 'Gagal mereset password.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      
      <div className="w-full max-w-[440px] animate-slide-up z-10">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl border border-slate-100 dark:border-slate-700/50">
          
          {step !== 4 && (
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6">
              {step === 1 && <User className="w-8 h-8" strokeWidth={1.5} />}
              {step === 2 && <Mail className="w-8 h-8" strokeWidth={1.5} />}
              {step === 3 && <KeyRound className="w-8 h-8" strokeWidth={1.5} />}
              {step === 4 && <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {step === 1 && "Lupa Password?"}
              {step === 2 && "Verifikasi OTP"}
              {step === 3 && "Reset Password"}
              {step === 4 && "Berhasil!"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {step === 1 && "Masukkan data diri Anda untuk menerima kode OTP."}
              {step === 2 && `Kode OTP 6-digit telah dikirim ke email Anda.`}
              {step === 3 && "Silakan masukkan password baru Anda."}
              {step === 4 && "Password Anda berhasil direset. Silakan login kembali."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-500/20 flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email"
                  placeholder="Alamat Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="NIP / NISN" 
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses...' : 'Kirim Kode OTP'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Masukkan 6 Digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full px-4 py-4 text-center tracking-[0.5em] font-bold text-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || otp.length < 6}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password"
                  placeholder="Password Baru" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password"
                  placeholder="Konfirmasi Password Baru" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <Link 
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Kembali ke Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
