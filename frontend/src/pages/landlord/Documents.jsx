import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';
import { FileText, Download, Clock, ShieldCheck, Loader2, X, Eye, FileSearch, Printer } from 'lucide-react';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null); // 1. Add state for the Preview Modal
  const [docContent, setDocContent] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const brandColor = '#54ab91';

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents'); 
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-[#54ab91]" size={40} />
    </div>
  );

  // Handler to open modal and fetch lease content if needed
  const handleViewDocument = async (doc) => {
    setSelectedDoc(doc);
    setDocContent('');
    if (doc.type?.toLowerCase() === 'lease' && doc.relatedId) {
      setDocLoading(true);
      try {
        // Fetch lease agreement content (markdown)
        const resp = await api.get(`/documents/lease/${doc.relatedId}`);
        setDocContent(resp.data || 'No content found.');
      } catch (err) {
        setDocContent('Failed to load lease content.');
      } finally {
        setDocLoading(false);
      }
    } else {
      setDocContent(doc.content || 'No content found.');
    }
  };

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Documents</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Digital Archives & Receipts</p>
        </div>
        <div className="bg-slate-50 text-slate-500 px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-100">
          <FileSearch size={16} />
          <span className="text-xs font-black uppercase tracking-wider">{documents.length} Records Found</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[#54ab91]/10 rounded-xl text-[#54ab91]">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-slate-900">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      className="px-5 py-2.5 bg-slate-100 group-hover:bg-[#54ab91] group-hover:text-white text-slate-700 rounded-xl text-xs font-black transition-all"
                      onClick={() => handleViewDocument(doc)}
                    >
                      View Document
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. --- PDF Preview Modal --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-2xl text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-none">{selectedDoc.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Urugo Verified Record • {formatDate(selectedDoc.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Printer size={20} />
                </button>
                <button 
                  onClick={() => setSelectedDoc(null)} 
                  className="p-3 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content - The actual "Document" view */}
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 font-serif">
              <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm border border-slate-100 min-h-full">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">{selectedDoc.type} AGREEMENT</h2>
                  <div className="h-1 w-20 bg-[#54ab91] mx-auto"></div>
                </div>

                {/* This is where the actual text from your lease logic goes */}
                <div className="text-slate-700 leading-relaxed space-y-6">
                  {docLoading ? (
                    <Loader2 className="animate-spin text-[#54ab91] mx-auto" size={32} />
                  ) : (
                    <ReactMarkdown>{docContent || "No content found."}</ReactMarkdown>
                  )}
                </div>

                <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between text-[10px] font-black uppercase text-slate-300 tracking-widest">
                  <span>Digitally Signed: Urugo System</span>
                  <span>Ref: {selectedDoc._id}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}/documents/download/${selectedDoc._id}`}
                download
                style={{ backgroundColor: brandColor }}
                className="flex items-center gap-2 px-8 py-3 text-white rounded-2xl font-black text-sm shadow-xl shadow-[#54ab91]/20 active:scale-95 transition-all"
              >
                <Download size={18} />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;