import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Urugo Rental - Modern Professional Login
 * Fully Integrated with AuthContext
 */

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Destructuring the global login handler
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session_expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await handleLogin({ email, password });

      const redirect = searchParams.get('redirect');
      const intent = searchParams.get('intent');

      if (redirect) {
        const next = intent
          ? `${redirect}${redirect.includes('?') ? '&' : '?'}intent=${encodeURIComponent(intent)}`
          : redirect;
        navigate(next, { replace: true });
        return;
      }

      const userRole = res?.user?.role || res?.role;
      if (userRole === 'landlord') navigate('/landlord'); 
      else if (userRole === 'tenant') navigate('/tenant');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* Visual Branding Section */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(160deg, rgba(84, 171, 145, 0.55) 0%, rgba(19, 45, 38, 0.98) 100%)' }}
        />

        <div className="relative z-20" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Urugo" className="h-12 w-auto brightness-0 invert object-contain" />
        </div>

        <div className="relative z-20 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <ShieldCheck size={16} className="text-white" />
            <span className="text-xs font-semibold tracking-wide uppercase">Trusted Rental Platform in Rwanda</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">Seamless Living Starts Here.</h1>
          <p className="text-xl text-white/80 leading-relaxed font-light">Providing the professional standard for property management in Rwanda.</p>
        </div>

        <div className="relative z-20 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-white/40"></div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">Kigali • Rwanda</span>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Sign in</h2>
            <p className="text-gray-500 text-lg">Access your Urugo dashboard.</p>
          </div>

          {sessionExpired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-bold">Session Expired</p>
                <p className="text-xs mt-0.5">Your session has timed out for security. Please sign in again.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors">
                  <Mail size={19} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kigali@urugo.rw"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <Link to="/forgot" className="text-xs font-bold text-[#54ab91] hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors">
                  <Lock size={19} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#54ab91] hover:bg-[#46967d] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#54ab91]/20 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500">
              New to our platform?{' '}
              <Link to="/register" className="text-[#54ab91] font-extrabold hover:underline">Join Urugo Today</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;