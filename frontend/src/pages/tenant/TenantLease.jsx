import React, { useEffect, useState } from 'react';
import { getTenantLease } from '../../services/leaseService';
import { FileText, Home, DollarSign, Calendar, User } from 'lucide-react';

const TenantLease = () => {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        console.log('🔍 Fetching tenant lease...');
        const data = await getTenantLease();
        console.log('✅ Lease data received:', data);
        console.log('📄 Lease terms:', data.lease?.terms);
        setLease(data.lease);
      } catch (error) {
        console.error("❌ No lease found", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) return <div className="p-8">Loading lease details...</div>;
  if (!lease) return <div className="p-8 text-slate-500">No active lease found.</div>;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#54ab91] p-6 text-white">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <FileText size={28} /> Your Lease Agreement
          </h2>
          <p className="text-white/80 text-sm mt-1">Active Rental Contract</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property & Landlord Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                <Home size={16} /> Property
              </div>
              <p className="font-bold text-slate-900">{lease.propertyId?.name || 'N/A'}</p>
              <p className="text-sm text-slate-600 mt-1">
                {lease.propertyId?.address?.street}, {lease.propertyId?.address?.city}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                <User size={16} /> Landlord
              </div>
              <p className="font-bold text-slate-900">
                {lease.landlordId?.firstName} {lease.landlordId?.lastName}
              </p>
              <p className="text-sm text-slate-600 mt-1">{lease.landlordId?.email}</p>
              {lease.landlordId?.phone && (
                <p className="text-sm text-slate-600">{lease.landlordId.phone}</p>
              )}
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-[#54ab91] pl-4">
              <p className="text-slate-500 text-sm">Unit Number</p>
              <p className="font-bold text-xl text-slate-900">{lease.unitNumber}</p>
            </div>
            <div className="border-l-4 border-[#54ab91] pl-4">
              <div className="flex items-center gap-1 text-slate-500 text-sm mb-1">
                <DollarSign size={14} /> Monthly Rent
              </div>
              <p className="font-black text-xl text-[#54ab91]">{lease.rentAmount?.toLocaleString()} RWF</p>
            </div>
            <div className="border-l-4 border-slate-300 pl-4">
              <p className="text-slate-500 text-sm">Status</p>
              <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase">
                {lease.status}
              </span>
            </div>
          </div>

          {/* Lease Duration */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800 text-sm font-bold mb-3">
              <Calendar size={16} /> Lease Duration
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-600 text-xs mb-1">Start Date</p>
                <p className="font-bold text-blue-900">{formatDate(lease.startDate)}</p>
              </div>
              <div>
                <p className="text-blue-600 text-xs mb-1">End Date</p>
                <p className="font-bold text-blue-900">{formatDate(lease.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={18} /> Terms & Conditions
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {lease.terms || 'No terms specified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantLease;