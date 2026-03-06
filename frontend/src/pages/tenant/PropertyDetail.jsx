import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPropertyById } from '../../services/propertyService';
import { createRentalRequest } from '../../services/rentalRequestService';
import ImageCarousel from '../../components/ImageCarousel';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    unitNumber: '',
    idType: 'national_id',
    idNumber: '',
    message: '',
    moveInDate: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPublicPropertyById(id);
        setProperty(res?.property || null); // important
      } catch (e) {
        console.error(e);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const vacantUnits = useMemo(
    () => (property?.units || []).filter((u) => u.status === 'vacant'),
    [property]
  );

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!property?._id) return;

    try {
      setSubmitting(true);
      await createRentalRequest({
        propertyId: property._id,
        ...requestForm
      });
      alert('Request sent to landlord');
      setRequestForm({
        unitNumber: '',
        idType: 'national_id',
        idNumber: '',
        message: '',
        moveInDate: ''
      });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading property...</div>;
  if (!property) return <div className="p-6">Property not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ImageCarousel images={property.images || []} />
            <div>
              <h1 className="text-3xl font-black">{property.name}</h1>
              <p className="text-slate-600">
                {property.address?.street}, {property.address?.city}, {property.address?.district}
              </p>
              <p className="mt-3 text-slate-700">{property.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-2xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold">Payment Terms</p>
                <p className="font-bold">{property.paymentTerms || 'full'}</p>
              </div>
              <div className="border rounded-2xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold">Minimum Stay</p>
                <p className="font-bold">{property.minStay || 30} days</p>
              </div>
              <div className="border rounded-2xl p-4">
                <p className="text-xs text-slate-400 uppercase font-bold">Caution Fee</p>
                <p className="font-bold">{Number(property.cautionFee || 0).toLocaleString()} RWF</p>
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg mb-2">Location Details</h3>
              <p className="text-slate-700">{property.locationDetails?.proximityNote || '-'}</p>
              <p className="text-sm text-slate-500 mt-1">
                Landmarks: {(property.locationDetails?.landmarks || []).join(', ') || '-'}
              </p>
              <p className="text-sm text-slate-500">
                Coordinates: {property.locationDetails?.coordinates?.lat ?? '-'}, {property.locationDetails?.coordinates?.lng ?? '-'}
              </p>
            </div>

            <div>
              <h3 className="font-black text-lg mb-2">Available Units</h3>
              {vacantUnits.length === 0 ? (
                <p className="text-slate-500">No vacant units currently.</p>
              ) : (
                <div className="space-y-2">
                  {vacantUnits.map((u) => (
                    <div key={u._id || u.unitNumber} className="border rounded-xl p-3 flex justify-between text-sm">
                      <div>
                        <p className="font-bold">Unit {u.unitNumber}</p>
                        <p className="text-slate-500">
                          {property.propertyType === 'commercial'
                            ? `${u.commercialUse || 'commercial'} • ${u.squareFeet || 0} sqft • Parking: ${u.parkingSpots || 0}`
                            : `${u.bedrooms || 0} bed • ${u.bathrooms || 0} bath • ${u.squareFeet || 0} sqft`}
                        </p>
                      </div>
                      <p className="font-black text-[#54ab91]">{Number(u.rent || 0).toLocaleString()} RWF</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="font-black text-lg mb-4">Request to Rent</h3>
              <form onSubmit={submitRequest} className="space-y-3">
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={requestForm.unitNumber}
                  onChange={(e) => setRequestForm({ ...requestForm, unitNumber: e.target.value })}
                  required
                >
                  <option value="">Select Unit</option>
                  {vacantUnits.map((u) => (
                    <option key={u.unitNumber} value={u.unitNumber}>
                      {u.unitNumber} - {Number(u.rent || 0).toLocaleString()} RWF
                    </option>
                  ))}
                </select>

                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={requestForm.idType}
                  onChange={(e) => setRequestForm({ ...requestForm, idType: e.target.value })}
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                </select>

                <input
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder={requestForm.idType === 'passport' ? 'Passport Number' : 'National ID Number'}
                  value={requestForm.idNumber}
                  onChange={(e) => setRequestForm({ ...requestForm, idNumber: e.target.value })}
                  required
                />

                <input
                  type="date"
                  className="w-full border rounded-xl px-3 py-2"
                  value={requestForm.moveInDate}
                  onChange={(e) => setRequestForm({ ...requestForm, moveInDate: e.target.value })}
                />

                <textarea
                  className="w-full border rounded-xl px-3 py-2"
                  rows={4}
                  placeholder="Message to landlord"
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                />

                <button
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#54ab91] text-white font-bold disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;