import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please verify your credentials.');
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medicare-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-medicare-600 text-white shadow-xl shadow-medicare-600/25 mb-4">
            <HeartPulse className="w-9 h-9 stroke-[2.3]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            MEDI<span className="text-medicare-600">CARE</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">
            Hospital Management System Portal
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Administrator Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to manage hospital operations.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@medicare.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500 focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500 focus:bg-white transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-medicare-600 hover:bg-medicare-700 text-white font-bold rounded-xl shadow-lg shadow-medicare-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-medicare-50/70 border border-medicare-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-medicare-900">Default Demo Account</p>
                <p className="text-[11px] text-medicare-700 font-mono mt-0.5">admin / admin123</p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="px-3 py-1.5 text-xs font-bold text-medicare-700 bg-white hover:bg-medicare-100 rounded-lg border border-medicare-200 shadow-xs transition-colors"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 Medicare Hospital Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;

