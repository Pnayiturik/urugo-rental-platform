import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../../services/propertyService';
import { TrendingUp, Home as HomeIcon, Building2, Plus, MapPin, Wallet, Circle, Loader2 } from 'lucide-react';

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const brandColor = '#54ab91';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data.properties || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const totalUnits = properties.reduce((sum, p) => sum + p.units.length, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.units.filter(u => u.status === 'occupied').length, 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const totalRevenue = properties.reduce((sum, p) => sum + p.units.filter(u => u.status === 'occupied').reduce((s, u) => s + u.rent, 0), 0);

  const stats = [
    { title: 'Revenue', value: `${totalRevenue.toLocaleString()} RWF`, sub: 'This Month', icon: <Wallet size={20} />, color: brandColor },
    { title: 'Units', value: totalUnits, sub: 'Total Units', icon: <HomeIcon size={20} />, color: '#3b82f6' },
    { title: 'Occupancy', value: `${occupancyRate}%`, sub: 'Occupied', icon: <TrendingUp size={20} />, color: '#10b981' },
    { title: 'Properties', value: properties.length, sub: 'Active Listings', icon: <Building2 size={20} />, color: '#f59e0b' }
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#54ab91]" size={40} /></div>
  );

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Portfolio Summary</p>
        </div>
        <button 
          onClick={() => navigate('/landlord/properties/new')}
          style={{ backgroundColor: brandColor }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl font-bold active:scale-95 transition-transform"
        >
          <Plus size={20} /> New Property
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 transition-colors hover:border-[#54ab91]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">{stat.icon}</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
            </div>
            <p className="text-2xl font-black mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Properties List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900">Recent Properties</h3>
            <button onClick={() => navigate('/landlord/properties')} className="text-sm font-bold text-[#54ab91]">View All</button>
          </div>

          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400">No properties added yet.</div>
            ) : (
              properties.slice(0, 4).map((property) => (
                <div key={property._id} onClick={() => navigate(`/landlord/properties/${property._id}`)} 
                     className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#54ab91] transition-all cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#54ab91] group-hover:bg-[#54ab91] group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-slate-900">{property.name}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-400 text-xs mt-1">
                      <MapPin size={12} /> <span>{property.address.city}, Rwanda</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">{property.units.length} Units</span>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100">
                      <Circle size={6} className="fill-green-500 text-green-500" />
                      <span className="text-[10px] font-black text-green-600 uppercase">Live</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h4 className="font-bold text-lg mb-2 text-[#54ab91]">Occupancy Goal</h4>
            <p className="text-xs text-slate-400 mb-6 font-medium">Your portfolio is at {occupancyRate}% capacity.</p>
            <div className="w-full bg-white/10 h-2 rounded-full mb-4">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${occupancyRate}%`, backgroundColor: brandColor }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
              <span>Low</span> <span className="text-white">{occupancyRate}%</span> <span>Full</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;