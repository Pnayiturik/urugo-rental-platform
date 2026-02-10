import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Users, 
  ArrowRight, 
  Building2, 
  History,
  Lock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

/**
 * Urugo Landing Page - Visual Refresh
 * Features: Full-background hero image, Logo-only branding, Tailwind CSS
 * Layout: Global width set to w-11/12 for consistent margins
 */

const LandingPage = () => {
  const navigate = useNavigate();
  const brandColor = '#54ab91';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center">
      
      {/* --- Navigation --- */}
      <nav className="w-11/12 flex items-center justify-between h-20 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-50 px-4 md:px-8 self-center rounded-b-2xl">
        <div className="flex items-center" onClick={() => navigate('/')}>
          {/* Logo Only branding */}
          <img src="/logo.png" alt="Urugo Logo" className="h-13 scale-150 w-auto object-contain"  />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-[#54ab91] transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-[#54ab91] transition-colors">Process</a>
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-900">Sign In</button>
          <button 
            onClick={() => navigate('/register')}
            style={{ backgroundColor: brandColor }}
            className="px-6 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg shadow-[#54ab91]/20 active:scale-95 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* --- Hero Section: Full Background Image --- */}
      <header className="w-11/12 mt-4 relative min-h-[85vh] flex items-center justify-center rounded-[3rem] overflow-hidden px-6 shadow-2xl">
        {/* Background Image Wrapper */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
            alt="Modern Rwandan Architecture" 
            className="w-full h-full object-cover"
          />
          {/* High-Contrast Overlay for readability */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
          <div className={`absolute inset-0 opacity-40`} style={{ background: `linear-gradient(135deg, ${brandColor} 0%, transparent 100%)` }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <ShieldCheck size={16} className="text-[#54ab91]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Rwanda's Trusted Rental Network</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1] text-white">
            Modern Living, <br/>
            <span style={{ color: brandColor }}>Managed with Trust.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
            Simple digital tools for verifying rental history and tracking MoMo payments across Rwanda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/register')}
              style={{ backgroundColor: brandColor }}
              className="w-full sm:w-auto px-10 py-4 text-white rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              Start Listing <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg backdrop-blur-md hover:bg-white/20 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Floating Verified Badge */}
        <div className="absolute bottom-8 right-8 z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl hidden lg:flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-full text-white">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">System Status</p>
            <p className="text-sm font-bold text-slate-900 mt-1">Live in Kigali</p>
          </div>
        </div>
      </header>

      {/* --- Visual Trust Section --- */}
      <section id="features" className="w-11/12 py-24 bg-white overflow-hidden relative self-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              A verifiable history <br/> for every <span style={{ color: brandColor }}>home.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              We bridge the gap between traditional trust and digital accountability. Our platform ensures that misconduct records persist, allowing great landlords to find great tenants.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
               {['ID Verification', 'MoMo Tracking', 'Maintenance', 'Legal Records'].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#54ab91]" />
                    <span className="font-bold text-xs uppercase tracking-widest text-slate-700">{item}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
             <div className="space-y-4">
               <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000" className="rounded-[2.5rem] h-80 w-full object-cover shadow-lg" alt="Exterior" />
             </div>
             <div className="space-y-4 pt-12">
               <img src="https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?w=1000" className="rounded-[2.5rem] h-80 w-full object-cover shadow-lg" alt="Interior" />
             </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="w-11/12 py-24 bg-slate-50 self-center rounded-[3rem] px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            { icon: <Smartphone className="text-blue-500" />, title: "MoMo Ready", desc: "Integrated with MTN & Airtel for instant rent tracking." },
            { icon: <History className="text-[#54ab91]" />, title: "Digital Record", desc: "Verifiable rental history that stays with the tenant." },
            { icon: <FileText className="text-orange-500" />, title: "Template Leases", desc: "Standardized contracts designed for local compliance." },
            { icon: <Building2 className="text-purple-500" />, title: "Income Stats", desc: "Generate property statements for bank and loan apps." },
            { icon: <Users className="text-emerald-500" />, title: "Secure Community", desc: "A network of accountability built on mutual respect." },
            { icon: <Lock className="text-slate-900" />, title: "Role-Based Data", desc: "Privacy first access control for owners and renters." }
          ].map((f, i) => (
            <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-[#54ab91]/30 transition-all shadow-sm">
              <div className="mb-6 inline-block p-4 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="w-11/12 py-24 self-center">
        <div className="relative rounded-[3rem] overflow-hidden min-h-[450px] flex items-center justify-center text-center px-6">
          <img 
            src="https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=2067" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Kigali View"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]" />
          
          <div className="relative z-10 space-y-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Modernize your <br/> rentals today.
            </h2>
            <button 
              onClick={() => navigate('/register')}
              style={{ backgroundColor: brandColor }}
              className="px-12 py-5 text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all"
            >
              Create account
            </button>
            <div className="flex items-center justify-center gap-8 text-white/60 font-bold uppercase tracking-widest text-[10px]">
               <div className="flex items-center gap-2"><MapPin size={14}/> Kigali</div>
               <div className="flex items-center gap-2"><MapPin size={14}/> Gisenyi</div>
               <div className="flex items-center gap-2"><MapPin size={14}/> Musanze</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="w-11/12 py-16 border-t border-slate-100 text-center self-center">
        <div className="space-y-8">
          <div className="flex justify-center">
            {/* Logo Only footer */}
            <img src="/logo.png" alt="Urugo" className="h-8 w-auto opacity-40 grayscale" />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Urugo Rental Management • Rwanda
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;