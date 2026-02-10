import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, Calendar, ArrowRight, Loader2, ShieldCheck, Building2 } from 'lucide-react';

/**
 * Urugo Rental - Modern Register Page
 * Built with Tailwind CSS Utility Classes
 * Brand Color: #54ab91
 */

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    role: 'landlord'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const brandColor = '#54ab91';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await handleRegister(formData);
      navigate(formData.role === 'landlord' ? '/landlord' : '/tenant');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* Left Side: Visual Section */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[3000ms] hover:scale-110"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2000&auto=format&fit=crop")' }}
        />
        
        {/* Modern Brand Gradient Overlay */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(160deg, rgba(84, 171, 145, 0.94) 0%, rgba(15, 35, 30, 0.98) 100%)' }}
        />

        {/* Branding */}
        <div className="relative z-20" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Urugo" className="h-10 w-auto scale-200 brightness-0 invert"  />
        </div>

        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <ShieldCheck size={14} className="text-white" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Rwanda's Leading Rental Network</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4 tracking-tight">
            Join the community <br/> of modern hosts.
          </h1>
          <p className="text-base text-white/80 leading-relaxed font-normal max-w-sm">
            Everything you need to manage your properties and tenants in one professional dashboard.
          </p>
        </div>

        <div className="relative z-20 flex items-center gap-3">
          <div className="h-0.5 w-8 bg-[#54ab91]"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">Urugo Rental • Kigali</span>
        </div>
      </div>

      {/* Right Side: Register Form Section */}
      <div className="flex w-full lg:w-7/12 items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-xl">
          
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-gray-500 font-medium">Start your journey with Urugo Rental today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Card (Modernized) */}
            <div className="p-4 rounded-2xl bg-[#54ab91]/5 border-2 border-[#54ab91] flex items-center gap-4">
              <div className="bg-[#54ab91] p-3 rounded-xl text-white">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Landlord Account</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Manage multiple properties and invite tenants digitally.
                </p>
              </div>
            </div>
            <input type="hidden" name="role" value="landlord" />

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@email.rw"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Phone & DOB Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250 780..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#54ab91] transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 text-white rounded-2xl font-bold text-base shadow-lg shadow-[#54ab91]/20 hover:shadow-[#54ab91]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              style={{ backgroundColor: brandColor }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold hover:underline underline-offset-4" style={{ color: brandColor }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;