import React, { useEffect, useState } from 'react';
import { getTenantLease } from '../../services/leaseService';

const TenantLease = () => {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const data = await getTenantLease();
        setLease(data.lease);
      } catch (error) {
        console.error("No lease found", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) return <div className="p-8">Loading lease details...</div>;
  if (!lease) return <div className="p-8 text-slate-500">No active lease found.</div>;

  return (
    <div className="p-8 max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-slate-900 mb-6">Your Lease Agreement</h2>
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Property</span>
          <span className="font-bold">{lease.propertyId?.name}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Unit Number</span>
          <span className="font-bold">{lease.unitNumber}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-500">Monthly Rent</span>
          <span className="font-bold text-[#54ab91]">{lease.rentAmount?.toLocaleString()} RWF</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 italic">
          "{lease.terms}"
        </div>
      </div>
    </div>
  );
};

export default TenantLease;