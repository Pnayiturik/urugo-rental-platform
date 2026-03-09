import React, { useEffect, useState } from 'react';
import { getTenantRequests } from '../../services/rentalRequestService';
import {
  SendHorizonal,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  Calendar,
  Loader2,
  InboxIcon,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',  icon: <Clock size={13} />,        label: 'Pending'  },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <CheckCircle2 size={13} />, label: 'Approved' },
  rejected: { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: <XCircle size={13} />,      label: 'Rejected' },
  assigned: { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    icon: <FileCheck2 size={13} />,   label: 'Assigned' },
};

function getStatus(req) {
  if (req.assignedLease) return 'assigned';
  return (req.status || 'pending').toLowerCase();
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function TenantRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await getTenantRequests();
        setRequests(data?.requests || []);
      } catch {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = {
    total:    requests.length,
    pending:  requests.filter(r => getStatus(r) === 'pending').length,
    approved: requests.filter(r => getStatus(r) === 'approved').length,
    assigned: requests.filter(r => getStatus(r) === 'assigned').length,
  };

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => getStatus(r) === filter);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#54ab91]" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-5xl mx-auto space-y-8 font-sans">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Requests</h2>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Track your rental applications</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: counts.total,    icon: <SendHorizonal size={20} className="text-[#54ab91]" />,   sub: 'Submitted' },
          { label: 'Pending',  value: counts.pending,  icon: <Clock size={20} className="text-amber-500" />,           sub: 'Awaiting review' },
          { label: 'Approved', value: counts.approved, icon: <CheckCircle2 size={20} className="text-emerald-500" />,  sub: 'Accepted' },
          { label: 'Assigned', value: counts.assigned, icon: <FileCheck2 size={20} className="text-blue-500" />,       sub: 'Lease created' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-slate-50 rounded-xl">{s.icon}</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl">
        {[
          { value: 'all',      label: 'All' },
          { value: 'pending',  label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              filter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
          <AlertCircle size={18} className="shrink-0" />{error}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-300">
            <InboxIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No requests found</h3>
          <p className="text-slate-500 text-sm">Browse available properties and submit a rental request to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-7 py-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-4">Property</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-3">Date Submitted</div>
            <div className="col-span-3">Status</div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((req) => {
              const status = getStatus(req);
              const cfg    = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              return (
                <div key={req._id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-7 py-5 items-center hover:bg-slate-50/40 transition-all">

                  {/* Property */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#54ab91]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Home size={16} className="text-[#54ab91]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">
                        {req.propertyId?.name || 'Property'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {req.propertyId?.address?.city || req.propertyId?.address || ''}
                      </p>
                    </div>
                  </div>

                  {/* Unit */}
                  <div className="md:col-span-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {req.requestedUnitLabel || req.requestedUnit || '—'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-3 flex items-center gap-2 text-slate-500 text-xs">
                    <Calendar size={13} />{formatDate(req.createdAt)}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                    {req.assignedLease && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">Lease document ready</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}