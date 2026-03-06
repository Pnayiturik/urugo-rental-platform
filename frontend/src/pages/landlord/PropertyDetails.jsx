import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, MapPin, Building2 } from 'lucide-react';
import { getPropertyById } from '../../services/propertyService';

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getPropertyById(id);
        setProperty(data?.property || data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#54ab91]" size={40} />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pt-20 px-4 text-red-600">
        {error || 'Property not found'}
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/landlord/properties')}
        className="text-sm font-bold text-[#54ab91] hover:underline"
      >
        ← Back to Properties
      </button>

      <div className="mt-4 bg-white border border-slate-200 rounded-3xl p-6">
        <h1 className="text-3xl font-black text-slate-900">{property?.name}</h1>
        <p className="text-slate-500 mt-1 flex items-center gap-1">
          <MapPin size={16} /> {property?.address?.street}, {property?.address?.city}
        </p>
        <p className="mt-3 text-slate-700">{property?.description || 'No description.'}</p>
        <p className="mt-3 text-slate-600 flex items-center gap-2">
          <Building2 size={16} /> {property?.propertyType}
        </p>
      </div>
    </div>
  );
}

export default PropertyDetails;