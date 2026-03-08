import React, { useState, useEffect } from 'react';
import { getTenants, deleteTenant } from '../../services/tenantService';
import { 
  Users, 
  Search, 
  MapPin, 
  MoreVertical, 
  Trash2, 
  Mail, 
  Building, 
  Hash,
  Loader2,
  Filter
} from 'lucide-react';

/**
 * Urugo Rental - Modern Renters (Tenants) Management
 * Features: Responsive Table, Flat Design, Brand Color #54ab91
 */

function Renters() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const brandColor = '#54ab91';

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data.tenants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this tenant? This will vacate the unit.')) {
      try {
        await deleteTenant(id);
        fetchTenants();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.propertyId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#54ab91]" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Renters</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">
            Manage your tenant community
          </p>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#54ab91] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search tenants..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#54ab91] focus:ring-4 focus:ring-[#54ab91]/5 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Renters Content */}
      {tenants.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No renters yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Tenants will appear here once you assign them to units in the Properties section.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-none">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            <div className="col-span-4">Tenant Info</div>
            <div className="col-span-3">Property & Unit</div>
            <div className="col-span-2 text-center">Rent</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-50">
            {filteredTenants.map((tenant) => (
              <div 
                key={tenant._id} 
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-colors"
              >
                {/* Tenant Info */}
                <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: brandColor }}
                  >
                    {tenant.userId?.firstName?.charAt(0)}{tenant.userId?.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {tenant.userId?.firstName} {tenant.userId?.lastName}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                      <Mail size={12} />
                      <span className="truncate">{tenant.userId?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Property & Unit */}
                <div className="col-span-1 md:col-span-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Building size={14} className="text-slate-400" />
                    <span className="truncate">{tenant.propertyId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                    <Hash size={14} />
                    <span>Unit {tenant.unitId || 'N/A'}</span>
                  </div>
                </div>

                {/* Rent (Mobile-friendly layout) */}
                <div className="col-span-1 md:col-span-2 text-left md:text-center">
                  <p className="text-sm font-black text-slate-900">
                    {Number(tenant.rentAmount).toLocaleString()} RWF
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Monthly</p>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2 flex md:justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    tenant.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {tenant.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-1 flex justify-end">
                  <button 
                    onClick={() => handleDelete(tenant._id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Tenant"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Insight */}
      {!loading && tenants.length > 0 && (
        <div className="flex items-center justify-center gap-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <Filter size={16} className="text-slate-400" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Showing {filteredTenants.length} total renters
          </p>
        </div>
      )}
    </div>
  );
}

export default Renters;