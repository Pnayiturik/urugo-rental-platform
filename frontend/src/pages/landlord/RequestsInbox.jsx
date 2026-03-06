import React, { useEffect, useState } from 'react';
import { getLandlordPendingRequests, assignRentalRequest } from '../../services/rentalRequestService';
import { 
  UserCheck, Clock, AlertCircle, Loader2, 
  CheckCircle2, ShieldCheck, History, Eye, X, 
  Mail, Phone, Fingerprint, MessageSquare, Building2, UserX, FileText 
} from 'lucide-react';

export default function RequestsInbox() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPreview, setShowPreview] = useState(false); // New state for moderation
  const brandColor = '#54ab91';

  const load = async () => {
    try {
      setLoading(true);
      const data = await getLandlordPendingRequests();
      setRequests(data?.requests || []);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFinalAssign = async (id) => {
    try {
      setBusyId(id);
      await assignRentalRequest(id);
      setShowPreview(false);
      setSelectedRequest(null);
      await load();
      alert("Success! Tenant moved to 'Renters' and Lease generated in 'Documents'.");
    } catch (e) {
      alert(e?.response?.data?.message || 'Assignment failed');
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#54ab91]" size={40} /></div>;

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Rental Requests</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Review verified tenant applications</p>
          {error && <p className="text-xs text-rose-500 font-bold mt-2">{error}</p>}
        </div>
        <div className="bg-emerald-50 text-[#54ab91] px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-100">
          <Clock size={16} />
          <span className="text-xs font-black uppercase tracking-wider">{requests.length} Pending Approvals</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">National ID</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-900">{r.firstName} {r.lastName}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-bold text-slate-700">{r.tenantEmail}</div>
                  <div className="text-xs text-slate-400">{r.phone}</div>
                </td>
                <td className="px-8 py-6 text-slate-600 font-medium text-sm">{r.nationalId}</td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => { setSelectedRequest(r); setShowPreview(true); }}
                    style={{ backgroundColor: brandColor }}
                    className="px-6 py-2.5 text-white rounded-xl font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Review & Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Lease Preview Modal (Moderation) --- */}
      {showPreview && selectedRequest && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">Lease Preview</h3>
                <button onClick={() => setShowPreview(false)}><X size={24} className="text-slate-300" /></button>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Tenant</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRequest.firstName} {selectedRequest.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Property</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRequest.propertyId?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Unit</span>
                  <span className="text-sm font-bold text-slate-900">Unit {selectedRequest.requestedUnitLabel || selectedRequest.requestedUnit}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Rent Amount</span>
                  <span className="text-lg font-black text-[#54ab91]">{Number(selectedRequest.requestedUnitRent || 0).toLocaleString()} RWF</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleFinalAssign(selectedRequest._id)}
                  disabled={busyId === selectedRequest._id}
                  style={{ backgroundColor: brandColor }}
                  className="flex-1 py-4 text-white rounded-2xl font-black text-sm active:scale-95 shadow-xl shadow-[#54ab91]/20 flex justify-center items-center gap-2"
                >
                  {busyId === selectedRequest._id ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                  Generate Lease & Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}