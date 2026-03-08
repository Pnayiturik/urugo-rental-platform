import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicProperties } from '../services/propertyService';
import { 
  MapPin, 
  Home, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  ShieldCheck,
  X,
  Sliders
} from 'lucide-react';

export default function PublicProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 });
  
  const navigate = useNavigate();
  const brandColor = '#54ab91';

  const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
  
  const resolveImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop';
    if (url.startsWith('http')) return url;
    return `${API_ORIGIN}${url}`;
  };

  const getMinRent = (p) => {
    const rents = (p?.units || []).map((u) => Number(u?.rent)).filter((n) => Number.isFinite(n));
    return rents.length ? Math.min(...rents) : 0;
  };

  const formatMoney = (n) => new Intl.NumberFormat('en-RW').format(n);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicProperties();
        setProperties(data?.properties || data || []);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const processedProperties = useMemo(() => {
    return properties
      .filter(p => {
        const minRent = getMinRent(p);
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = minRent >= priceRange.min && minRent <= priceRange.max;
        return matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        const rentA = getMinRent(a);
        const rentB = getMinRent(b);
        return sortOrder === 'asc' ? rentA - rentB : rentB - rentA;
      });
  }, [properties, searchTerm, priceRange, sortOrder]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#54ab91] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Urugo Network...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center pb-20">
      
      {/* Navigation - Soft Gray Frosted Glass Implementation */}
      <nav className="w-11/12 flex items-center justify-between h-20 bg-slate-50/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-4 md:px-8 self-center rounded-b-3xl shadow-sm transition-all duration-300">
        <div className="flex items-center cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Urugo Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-500 px-4 py-2 hover:text-[#54ab91] transition-colors">Sign In</button>
           <button 
            onClick={() => navigate('/register')} 
            style={{ backgroundColor: brandColor }} 
            className="px-5 md:px-8 py-3 text-white rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-[#54ab91]/20 active:scale-95 transition-all"
          >
            Join Urugo
          </button>
        </div>
      </nav>

      {/* Filter Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 p-8 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black">Filters</h2>
          <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-50 rounded-full"><X size={24} /></button>
        </div>
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Max Rent (RWF)</label>
            <input type="range" min="0" max="3000000" step="50000" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#54ab91]" />
            <div className="flex justify-between mt-2 text-sm font-bold text-slate-900">
              <span>0</span>
              <span>{formatMoney(priceRange.max)} RWF</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Sort Order</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSortOrder('asc')} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${sortOrder === 'asc' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 text-slate-400'}`}>Price: Low-High</button>
              <button onClick={() => setSortOrder('desc')} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${sortOrder === 'desc' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-100 text-slate-400'}`}>Price: High-Low</button>
            </div>
          </div>
        </div>
      </div>

      <header className="w-11/12 mt-12 mb-16 self-center">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
              <ShieldCheck size={14} className="text-[#54ab91]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Verified Listings</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-none">Find your next <span style={{ color: brandColor }}>home.</span></h1>
            <div className="relative group max-w-lg">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#54ab91]" size={20} />
              <input type="text" placeholder="Search neighborhood..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#54ab91] transition-all font-medium" />
            </div>
          </div>
          <button onClick={() => setShowFilters(true)} className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm hover:scale-105 transition-all shadow-xl">
            <SlidersHorizontal size={18} /> Filters & Sort
          </button>
        </div>
      </header>

      <main className="w-11/12 self-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedProperties.map((p) => {
            const minRentValue = getMinRent(p);
            const vacantCount = (p.units || []).filter(u => String(u.status).toLowerCase() === 'vacant').length;
            return (
              <article key={p._id} onClick={() => navigate(`/properties/${p._id}`)} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={resolveImageUrl(p?.images?.[0])} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                    <div className={`w-2 h-2 rounded-full ${vacantCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-wider">{vacantCount} Vacant</span>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#54ab91] transition-colors">{p.name}</h3>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</p>
                      <p className="text-xl font-black text-slate-900 mt-1">{formatMoney(minRentValue)} RWF</p>
                    </div>
                    <div className="bg-[#54ab91] p-3 rounded-2xl text-white transform group-hover:translate-x-1 transition-transform shadow-lg shadow-[#54ab91]/20">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}