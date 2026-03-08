import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocs(res.data.documents);
      } catch (err) {
        console.error("Error fetching documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Documents</h1>
      <div className="grid gap-4">
        {loading ? <p>Loading...</p> : docs.map(doc => (
          <div key={doc._id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
            <div>
              <p className="font-semibold text-blue-600">{doc.title}</p>
              <p className="text-sm text-gray-500">Type: {doc.type} | Status: {doc.status}</p>
            </div>
            <a href={doc.fileUrl} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Download
            </a>
          </div>
        ))}
        {!loading && docs.length === 0 && <p>No documents found.</p>}
      </div>
    </div>
  );
};

export default Documents;