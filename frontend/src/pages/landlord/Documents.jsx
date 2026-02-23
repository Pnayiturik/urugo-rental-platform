import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Download, Clock, ShieldCheck, Loader2 } from 'lucide-react';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const brandColor = '#54ab91';

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // This endpoint will fetch from the Document model we created
        const response = await api.get('/auth/documents'); 
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#54ab91]" /></div>;

  return (
    <div className="pt-8 px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Documents</h2>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Digital Archives & Receipts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc._id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-[#54ab91] transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#54ab91]/10 rounded-2xl text-[#54ab91]">
                <FileText size={24} />
              </div>
              <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {doc.type}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{doc.title}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
              <Clock size={12} />
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>

            <button className="w-full py-3 bg-slate-100 group-hover:bg-[#54ab91] group-hover:text-white text-slate-900 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              <Download size={14} /> View Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Documents;