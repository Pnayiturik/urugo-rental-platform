import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicPropertyById } from '../services/propertyService';
import { sendPublicRentalRequest } from '../services/rentalRequestService';
import { 
  MapPin, 
  Home, 
  Banknote, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function PublicPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const brandColor = '#54ab91';
  
  const [property, setProperty] = useState(null);
  const [unitId, setUnitId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sent, setSent] = useState(false);
  const sentKey = `urugo_request_sent_${id}`;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idType: 'nationalId',
    idNumber: '',
    message: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicPropertyById(id);
        const p = data?.property || data || null;
        setProperty(p);

        const firstVacant = (p?.units || []).find((u) => String(u.status).toLowerCase() === 'vacant');
        setUnitId(firstVacant?._id || '');
      } catch (e) {
        console.error(e);
        setProperty(null);
      }
    })();
  }, [id]);

  const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
  const resolveImageUrl = (url) => (!url ? '' : (url.startsWith('http') ? url : `${API_ORIGIN}${url}`));

  const images = useMemo(() => {
    const arr = property?.images || property?.imageUrls || property?.photos || [];
    return Array.isArray(arr) ? arr : [];
  }, [property]);

  const units = property?.units || [];
  const vacantUnits = (units || []).filter((u) => String(u?.status).toLowerCase() === 'vacant');
  const rents = units.map((u) => Number(u?.rent)).filter((n) => Number.isFinite(n));
  const minRent = rents.length ? Math.min(...rents) : null;

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.street, addr.city, addr.district].filter(Boolean).join(', ');
  };

  const formatMoney = (n) => new Intl.NumberFormat('en-RW').format(n);

  const submit = async (e) => {
    e.preventDefault();
    if (sent) return;

    // Validate start and end dates
    if (!form.startDate || !form.endDate) {
      alert('Please select both a lease start date and end date.');
      return;
    }

    try {
      setSubmitting(true);

      const raw = localStorage.getItem('userInfo');
      const parsed = raw ? JSON.parse(raw) : null;
      const requesterUserId = parsed?.id || parsed?._id || parsed?.user?.id || parsed?.user?._id || null;

      const resp = await sendPublicRentalRequest({
        ...form,
        propertyId: id,
        requestedUnit: unitId || undefined,
        nationalId: form.idNumber,
        requesterUserId // keeps tenant id when available
      });

      localStorage.setItem(sentKey, JSON.stringify({
        requestId: resp?.request?._id || null,
        propertyId: id,
        sentAt: new Date().toISOString()
      }));
      setSent(true);

      alert('Request submitted. The landlord will review your application.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-[#54ab91] font-black uppercase tracking-widest">Loading Urugo Property...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center pb-20">
      
      {/* --- Navigation --- */}
      <nav className="w-11/12 flex items-center justify-between h-20 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-50 px-4 self-center rounded-b-2xl">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Urugo Logo" className="h-12 w-auto object-contain" />
        </div>
        <button 
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#54ab91] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>
      </nav>

      <main className="w-11/12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 self-center">
        
        {/* --- Left Column: Content --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header */}
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <ShieldCheck size={14} className="text-[#54ab91]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#54ab91]">Verified Property</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{property.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin size={18} className="text-[#54ab91]" />
              {formatAddress(property.address)}
            </div>
          </section>

          {/* Image Slider */}
          {!!images.length && (
            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl group bg-slate-100">
              <img
                src={resolveImageUrl(images[slide])}
                alt={`Property view ${slide + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all active:scale-90">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={() => setSlide((s) => (s + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all active:scale-90">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <Home size={20} className="mb-3 text-[#54ab91]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
              <p className="font-bold text-slate-900">{property.propertyType}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <Banknote size={20} className="mb-3 text-blue-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting From</p>
              <p className="font-bold text-slate-900">{minRent ? `${formatMoney(minRent)} RWF` : 'N/A'}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 col-span-2 md:col-span-1">
              <CheckCircle2 size={20} className="mb-3 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
              <p className="font-bold text-slate-900">{vacantUnits.length} Units Vacant</p>
            </div>
          </div>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Info size={22} className="text-[#54ab91]" /> Description
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
              {property.description || 'Welcome to this modern Urugo managed property. This home is maintained with the highest standards of trust and accountability.'}
            </p>
          </section>

          {/* Units List */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black">Available Units</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {units.map((u) => (
                <div key={u._id} className="p-5 rounded-3xl border border-slate-100 bg-white flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-black text-slate-900">Unit {u.unitNumber || u.name}</p>
                    <p className="text-sm font-bold text-[#54ab91]">{formatMoney(u.rent)} RWF/mo</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${
                    u.status === 'vacant' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- Right Column: Request Form --- */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl border border-white/10">
            <h2 className="text-2xl font-black mb-2">Request to Rent</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Submit your details to start the application process.</p>
            
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="First name" 
                  value={form.firstName} 
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                  required 
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold" 
                />
                <input 
                  placeholder="Last name" 
                  value={form.lastName} 
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                  required 
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold" 
                />
              </div>

              <input 
                placeholder="Email Address" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold" 
              />
              
              <input 
                placeholder="Phone (MoMo enabled)" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold" 
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Identity Verification</label>
                <div className="flex gap-2">
                  <select 
                    value={form.idType} 
                    onChange={(e) => setForm({ ...form, idType: e.target.value })} 
                    className="bg-white/5 border border-white/10 rounded-2xl px-3 py-4 outline-none text-xs font-bold"
                  >
                    <option value="nationalId" className="text-slate-900">National ID</option>
                    <option value="passport" className="text-slate-900">Passport</option>
                  </select>
                  <input
                    placeholder={form.idType === 'passport' ? 'Passport #' : '16-Digit ID'}
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    required
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <select 
                value={unitId} 
                onChange={(e) => setUnitId(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold" 
                required
              >
                <option value="" className="text-slate-900">Select preferred vacant unit</option>
                {vacantUnits.map((u) => (
                  <option key={u._id} value={u._id} className="text-slate-900">
                    Unit {u.unitNumber} — {formatMoney(u.rent)} RWF
                  </option>
                ))}
              </select>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Lease Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Lease End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <textarea 
                placeholder="Anything else for the landlord?" 
                value={form.message} 
                onChange={(e) => setForm({ ...form, message: e.target.value })} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#54ab91] transition-all text-sm font-bold min-h-24 resize-none" 
              />

              <button 
                type="submit" 
                disabled={sent || submitting || !vacantUnits.length} 
                style={{ backgroundColor: brandColor }}
                className="w-full py-5 rounded-2xl text-white font-black text-lg shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {sent ? 'Application Sent' : (submitting ? 'Sending Request...' : 'Send Application')}
              </button>

              {!vacantUnits.length && (
                <p className="text-center text-xs text-rose-400 font-bold">Currently no vacant units available.</p>
              )}
            </form>
          </div>
        </aside>
      </main>

      {/* --- Footer --- */}
      <footer className="w-11/12 py-16 border-t border-slate-100 text-center self-center mt-20">
        <img src="/logo.png" alt="Urugo" className="h-8 w-auto opacity-30 grayscale mx-auto mb-6" />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          © 2026 Urugo Rental Management • Rwanda
        </p>
      </footer>
    </div>
  );
}