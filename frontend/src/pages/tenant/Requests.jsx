import React, { useEffect, useState } from 'react';
import { getTenantRequests } from '../../services/rentalRequestService';

export default function TenantRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getTenantRequests();
        setRequests(data?.requests || []);
      } catch {
        setError('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-600 mt-2">No requests found.</p>
      ) : (
        <div className="grid gap-4 mt-4">
          {requests.map((req) => (
            <div key={req._id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-blue-600">{req.propertyId?.name} - Unit {req.requestedUnitLabel}</p>
                <p className="text-sm text-gray-500">Status: {req.status}</p>
                <p className="text-xs text-gray-400">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                {req.assignedLease && <p className="text-xs text-green-600 font-bold">Lease Assigned</p>}
              </div>
              <div className="mt-2 md:mt-0">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{req.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}