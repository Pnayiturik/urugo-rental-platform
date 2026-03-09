import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  FileText,
  FileCheck2,
  Receipt,
  Download,
  Loader2,
  FolderOpen,
  Calendar,
  Tag,
  ExternalLink
} from 'lucide-react';

const TYPE_CONFIG = {
  Lease:          { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: <FileCheck2 size={20} className="text-blue-500" /> },
  lease:          { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: <FileCheck2 size={20} className="text-blue-500" /> },
  Receipt:        { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Receipt size={20} className="text-emerald-500" /> },
  receipt:        { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Receipt size={20} className="text-emerald-500" /> },
  IncomeStatement:{ bg: 'bg-violet-50',  text: 'text-violet-600',  icon: <FileText size={20} className="text-violet-500" /> },
  contract:       { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: <FileText size={20} className="text-amber-500" /> },
  other:          { bg: 'bg-slate-50',   text: 'text-slate-600',   icon: <FileText size={20} className="text-slate-400" /> },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.other;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const Documents = () => {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/documents');
        setDocs(res.data.documents || []);
      } catch (err) {
        console.error('Error fetching documents', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const docTypes = ['all', ...Array.from(new Set(docs.map(d => d.type).filter(Boolean)))];

  const filtered = filter === 'all' ? docs : docs.filter(d => d.type === filter);

  const counts = {
    total:   docs.length,
    leases:  docs.filter(d => ['Lease','lease'].includes(d.type)).length,
    receipts:docs.filter(d => ['Receipt','receipt'].includes(d.type)).length,
  };

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
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Documents</h2>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Lease agreements &amp; payment receipts</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: counts.total,    icon: <FolderOpen size={20} className="text-[#54ab91]" />,       sub: 'All documents' },
          { label: 'Leases',   value: counts.leases,   icon: <FileCheck2 size={20} className="text-blue-500" />,        sub: 'Agreements' },
          { label: 'Receipts', value: counts.receipts, icon: <Receipt size={20} className="text-emerald-500" />,        sub: 'Payment records' },
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
      {docTypes.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl">
          {docTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest transition-all ${
                filter === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      )}

      {/* Documents List */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-300">
            <FolderOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No documents yet</h3>
          <p className="text-slate-500 text-sm">Your lease agreements and payment receipts will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
          {/* Header row – desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-7 py-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">Document</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-2">Date Added</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((doc) => {
              const cfg = getTypeConfig(doc.type);
              const hasFile = doc.fileUrl && !doc.fileUrl.startsWith('#');
              return (
                <div key={doc._id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-7 py-5 items-center hover:bg-slate-50/40 transition-all">

                  {/* Document name */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-snug">
                        {doc.title || doc.name || 'Untitled Document'}
                      </p>
                      {doc.relatedModel && (
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{doc.relatedModel}</p>
                      )}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="md:col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                      <Tag size={11} />{doc.type || 'Document'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 flex items-center gap-2 text-slate-500 text-xs">
                    <Calendar size={13} />{formatDate(doc.createdAt)}
                  </div>

                  {/* Action */}
                  <div className="md:col-span-2 flex justify-start md:justify-end">
                    {hasFile ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
                      >
                        <Download size={13} /> Download
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-default">
                        <ExternalLink size={13} /> View
                      </span>
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
};

export default Documents;