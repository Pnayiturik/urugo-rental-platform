import React, { useState, useEffect } from 'react';
import { getMyLeases, createLease } from '../../services/leaseService';
import { FileText, Plus, X, Calendar, User, Building2 } from 'lucide-react';

function Leases() {
  const [leases, setLeases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const brandColor = '#54ab91';

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    const data = await getMyLeases();
    setLeases(data.leases);
  };

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lease Agreements</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Digital Contract Records</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: brandColor }}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-bold transition-all active:scale-95"
        >
          <Plus size={20} /> New Lease
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Property</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rent</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leases.map((lease) => (
              <tr key={lease._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 font-bold text-slate-900">{lease.tenantId?.name || 'Invited Tenant'}</td>
                <td className="px-8 py-6 text-slate-600 font-medium">{lease.propertyId?.name} (Unit {lease.unitNumber})</td>
                <td className="px-8 py-6 font-black text-[#54ab91]">{lease.rentAmount} RWF</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                    {lease.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leases;