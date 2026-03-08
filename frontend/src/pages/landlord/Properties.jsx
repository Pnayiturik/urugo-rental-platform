import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Custom marker icon for leaflet (default icon fix)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});
// Map picker component for selecting coordinates
function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value && value.lat && value.lng ? [parseFloat(value.lat), parseFloat(value.lng)] : [-1.9577, 30.1127]); // Default: Kigali

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onChange({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
      }
    });
    return position ? <Marker position={position} icon={markerIcon} /> : null;
  }

  return (
    <div className="my-2">
      <MapContainer center={position} zoom={13} style={{ height: 220, width: '100%', borderRadius: '1rem' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <div className="text-xs text-slate-500 mt-1">Click on the map to set property location.</div>
    </div>
  );
}
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getProperties,
  createProperty,
  deleteProperty,
  uploadPropertyImages
} from '../../services/propertyService';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';

const brandColor = '#54ab91';

const initialForm = {
  name: '',
  address: { street: '', city: '', district: '', country: 'Rwanda' },
  propertyType: '',
  description: '',
  units: [],
  images: [],
  cautionFee: '',
  paymentTerms: 'full',
  furnishingStatus: 'unfurnished',
  squareFootage: '',
  yearBuilt: '',
  utilitiesIncluded: [],
  locationDetails: {
    coordinates: { lat: '', lng: '' },
    landmarksText: '',
    proximityNote: ''
  },
  minStay: 30
};

const initialUnit = {
  unitNumber: '',
  bedrooms: 1,
  bathrooms: 1,
  squareFeet: '',
  rent: '',
  commercialUse: 'office',
  parkingSpots: '',
  status: 'vacant'
};

const utilityOptions = ['Water', 'Electricity', 'Internet', 'Security', 'Parking'];

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const isCommercial = formData.propertyType === 'commercial';

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') setShowModal(true);
  }, [location.search]);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data?.properties || data || []);
    } catch (err) {
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    setFormData((prev) => {
      const next = { ...prev };
      let ref = next;

      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }

      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleUtilityToggle = (utility) => {
    setFormData((prev) => {
      const exists = prev.utilitiesIncluded.includes(utility);
      return {
        ...prev,
        utilitiesIncluded: exists
          ? prev.utilitiesIncluded.filter((u) => u !== utility)
          : [...prev.utilitiesIncluded, utility]
      };
    });
  };

  const addUnit = () => {
    setFormData((prev) => ({ ...prev, units: [...prev.units, { ...initialUnit }] }));
  };

  const removeUnit = (index) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }));
  };

  const updateUnitField = (index, key, value) => {
    setFormData((prev) => {
      const units = [...prev.units];
      units[index] = { ...units[index], [key]: value };
      return { ...prev, units };
    });
  };

  const handleFileChange = (e) => {
    setSelectedImages(Array.from(e.target.files || []));
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setSelectedImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.propertyType || !formData.address.street || !formData.address.city) {
      alert('Please fill required property fields');
      return;
    }

    if (!formData.description?.trim()) {
      alert('Please add a property description');
      return;
    }

    if (!formData.units.length) {
      alert('Please add at least one unit');
      return;
    }

    setSubmitting(true);
    try {
      const selectedFiles = selectedImages;
      const uploadedUrls = selectedFiles.length ? await uploadPropertyImages(selectedFiles) : [];
      const payload = {
        ...formData,
        images: uploadedUrls
      };

      await createProperty(payload);
      closeModal();
      await fetchProperties();
      navigate('/landlord/properties');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_ORIGIN}${url}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#54ab91]" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Properties</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Manage your rental assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: brandColor }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl font-bold active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>Add Property</span>
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">No properties yet</h3>
          <button onClick={() => setShowModal(true)} style={{ color: brandColor }} className="font-bold hover:underline">
            Add your first property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <img
                src={
                  property?.images?.[0]
                    ? resolveImageUrl(property.images[0])
                    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop'
                }
                alt={property?.name || 'Property'}
                className="h-44 w-full object-cover"
              />
              <div className="p-5 space-y-1">
                <h3 className="text-lg font-black text-slate-900">{property.name}</h3>
                <p className="text-sm text-slate-500">
                  {property?.address?.street}, {property?.address?.city}
                </p>
              </div>
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => navigate(`/landlord/properties/${property._id}`)}
                  className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-2xl text-sm font-bold"
                >
                  Details
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">New Property</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-900">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Property Name" className="md:col-span-2 w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none">
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
                <input name="address.street" value={formData.address.street} onChange={handleChange} placeholder="Street" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <input name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <input name="address.district" value={formData.address.district} onChange={handleChange} placeholder="District" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="number" name="cautionFee" value={formData.cautionFee} onChange={handleChange} placeholder="Caution Fee (RWF)" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none">
                    <option value="full">Full</option>
                    <option value="installments">Installments</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {utilityOptions.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUtilityToggle(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        formData.utilitiesIncluded.includes(u)
                          ? 'bg-[#54ab91] text-white border-[#54ab91]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} placeholder="Year Built" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <input type="number" name="squareFootage" value={formData.squareFootage} onChange={handleChange} placeholder="Size (sq ft)" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <select name="furnishingStatus" value={formData.furnishingStatus} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none">
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Property Description" className="md:col-span-2 w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <textarea name="locationDetails.proximityNote" value={formData.locationDetails.proximityNote} onChange={handleChange} rows={3} placeholder="Location Notes" className="md:col-span-2 w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Pick Location on Map</label>
                  <LocationPicker
                    value={formData.locationDetails.coordinates}
                    onChange={(coords) => setFormData((prev) => ({
                      ...prev,
                      locationDetails: {
                        ...prev.locationDetails,
                        coordinates: coords
                      }
                    }))}
                  />
                </div>
                <input name="locationDetails.landmarksText" value={formData.locationDetails.landmarksText} onChange={handleChange} placeholder="Landmarks (comma separated)" className="md:col-span-2 w-full px-5 py-4 bg-slate-50 border rounded-2xl focus:border-[#54ab91] outline-none" />
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <span>Property Images</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2" fill="#e0f2f1" stroke="#54ab91" strokeWidth="1.5"/><circle cx="8.5" cy="11.5" r="2.5" fill="#54ab91"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#54ab91" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </label>
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    aria-label="Choose property images"
                  />
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm relative z-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#54ab91"><rect x="3" y="5" width="18" height="14" rx="2" fill="#e0f2f1" stroke="#54ab91" strokeWidth="1.5"/><circle cx="8.5" cy="11.5" r="2.5" fill="#54ab91"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#54ab91" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span className="text-slate-500">Choose file</span>
                    <span className="text-slate-400 ml-2">(Image upload area)</span>
                  </div>
                </div>
                {selectedImages.length > 0 && (
                  <div className="rounded-xl border border-[#54ab91]/20 bg-[#54ab91]/5 p-3 mt-2">
                    <p className="text-xs font-bold text-[#54ab91] mb-2">{selectedImages.length} image(s) ready for upload</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedImages.map((f, i) => (
                        <span key={i} className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1">{f.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Property Units</h4>
                  <button type="button" onClick={addUnit} className="px-4 py-2 text-xs font-bold text-[#54ab91] bg-[#54ab91]/10 rounded-xl flex items-center gap-1">
                    <Plus size={14} /> Add Unit
                  </button>
                </div>

                {formData.units.length === 0 && (
                  <div className="p-3 border border-red-200 bg-red-50 rounded-xl text-xs text-red-600">
                    Please add at least one unit.
                  </div>
                )}

                {formData.units.map((unit, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeUnit(index)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input value={unit.unitNumber} onChange={(e) => updateUnitField(index, 'unitNumber', e.target.value)} placeholder="Unit No." className="w-full px-3 py-2 bg-white border rounded-xl focus:border-[#54ab91] outline-none" />
                      <input type="number" value={unit.rent} onChange={(e) => updateUnitField(index, 'rent', e.target.value)} placeholder="Rent (RWF)" className="w-full px-3 py-2 bg-white border rounded-xl focus:border-[#54ab91] outline-none" />
                      {!isCommercial && (
                        <>
                          <input type="number" value={unit.bedrooms} onChange={(e) => updateUnitField(index, 'bedrooms', e.target.value)} placeholder="Bedrooms" className="w-full px-3 py-2 bg-white border rounded-xl focus:border-[#54ab91] outline-none" />
                          <input type="number" value={unit.bathrooms} onChange={(e) => updateUnitField(index, 'bathrooms', e.target.value)} placeholder="Bathrooms" className="w-full px-3 py-2 bg-white border rounded-xl focus:border-[#54ab91] outline-none" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-slate-500">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ backgroundColor: brandColor }}
                className="flex-1 py-3 text-sm font-bold text-white rounded-2xl disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Properties;