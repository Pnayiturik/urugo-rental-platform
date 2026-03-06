import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProperties } from '../../services/propertyService';

const TenantProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getPublicProperties();
        const data = res?.properties || [];
        const available = data.filter((p) => (p.units || []).some((u) => !u?.status || u.status === 'vacant'));
        setProperties(available);
      } catch (e) {
        console.error(e);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    const interval = setInterval(fetchProperties, 30000);
    return () => clearInterval(interval);
  }, []);

  const minRent = (units = []) => {
    const rents = units.map((u) => Number(u.rent || 0)).filter(Boolean);
    return rents.length ? Math.min(...rents) : null;
  };

  if (loading) return <div className="p-6">Loading properties...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Properties</h1>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((p) => {
          const start = minRent(p.units);
          return (
            <div key={p._id} className="border rounded-2xl overflow-hidden bg-white">
              {p?.images?.[0] ? (
                <img
                  src={p.images[0]}
                  alt={p?.name || 'Property'}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  No image
                </div>
              )}
              <div className="p-4 space-y-1">
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-sm text-gray-600">{p.address?.street}, {p.address?.city}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{p.description || 'No description provided.'}</p>
                <p className="text-sm">Terms: {p.paymentTerms || 'full'}</p>
                <p className="text-sm">Min Stay: {p.minStay || 30} days</p>
                {start && <p className="text-sm font-bold text-[#54ab91]">From {start.toLocaleString()} RWF</p>}
                <Link className="text-[#54ab91] font-medium" to={`/properties/${p._id}`}>
                  View details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TenantProperties;