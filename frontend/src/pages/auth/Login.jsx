import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

/**
 * Urugo Rental - Modern Professional Login
 * Features: Tailwind CSS, Responsive Design, Brand Color #54ab91, Lucide Icons
 */

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await handleLogin({ email, password });
      navigate(data.user.role === 'landlord' ? '/landlord' : '/tenant');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* Left Side: Modern Visual Section (Hidden on Mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white overflow-hidden">
        {/* Background Image with optimized overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop")' }}
        />
        
        {/* Brand Gradient Overlay - Ensures text is always visible */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(160deg, rgba(84, 171, 145, 0.55) 0%, rgba(19, 45, 38, 0.98) 100%)' }}
        />

        {/* Content Layer */}
        <div className="relative z-20" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Urugo" className="h-12 w-auto brightness-0 invert object-contain scale-200" />
        </div>

        <div className="relative z-20 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <ShieldCheck size={16} className="text-white" />
            <span className="text-xs font-semibold tracking-wide uppercase">Trusted Rental Platform in Rwanda</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Seamless Living Starts Here.
          </h1>
          <p className="text-xl text-white/80 leading-relaxed font-light">
            Providing the professional standard for property management in the Land of a Thousand Hills.
          </p>
        </div>

        <div className="relative z-20 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-white/40"></div>
          <span className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">Kigali • Rwanda</span>
        </div>
      </div>

      {/* Right Side: Professional Form Section */}
      <div className="flex w-full lg:w-5/12 items-center justify-center p-8 sm:p-12 md:p-16 lg:p-20 bg-white">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Sign in</h2>
            <p className="text-gray-500 text-lg">Enter your details to access Urugo.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <Link to="/forgot" className="text-xs font-bold text-[#54ab91] hover:underline transition-all">
                  Forgot Password?
                </Link>
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
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/10 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group flex items-center justify-center gap-3 py-4 bg-[#54ab91] hover:bg-[#46967d] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#54ab91]/20 hover:shadow-[#54ab91]/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-gray-500">
              New to our platform?{' '}
              <Link to="/register" className="text-[#54ab91] font-extrabold hover:underline">
                Join Urugo Today
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;