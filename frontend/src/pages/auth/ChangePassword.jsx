import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

/**
 * ChangePassword – Tenant first-login password change screen.
 * The server stores a short-lived firstLoginToken in localStorage.token
 * (set by AuthContext.handleLogin). This page calls POST /auth/complete-first-login
 * with that token, receives a full 7-day JWT, and stores it before redirecting
 * the tenant to their dashboard.
 */
function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const firstLoginToken = localStorage.getItem('token');
    if (!firstLoginToken) {
      setError('Session expired. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/complete-first-login', {
        firstLoginToken,
        newPassword
      });

      // Store the real 7-day token
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem(
          'userInfo',
          JSON.stringify({ token: data.token, user: data.user })
        );
      }

      navigate('/tenant', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update password. Please try again.';
      setError(msg);
      if (err?.response?.status === 401) {
        // Token expired – send back to login
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#54ab91]/10 rounded-2xl">
            <ShieldCheck size={28} className="text-[#54ab91]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set Your Password</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome! Please create a secure password to access your dashboard.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#54ab91] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#54ab91] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#54ab91] hover:bg-[#3f8f78] text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Activate My Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
