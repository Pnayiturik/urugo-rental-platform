import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties, createProperty, deleteProperty } from '../../services/propertyService';
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Building2, 
  X, 
  Bed, 
  Bath, 
  Banknote, 
  Loader2, 
  ExternalLink,
  Search
} from 'lucide-react';

/**
 * Urugo Rental - Properties Management
 * Modern UI with Tailwind CSS and Brand Color #54ab91
 */

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: { street: '', city: '', district: '', country: 'Rwanda' },
    propertyType: '',
    units: []
  });
  const [unitData, setUnitData] = useState({
    unitNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: '',
    rent: ''
  });
  
  const navigate = useNavigate();
  const brandColor = '#54ab91';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data.properties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, address: { ...formData.address, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUnitChange = (e) => {
    setUnitData({ ...unitData, [e.target.name]: e.target.value });
  };

  const addUnit = () => {
    if (unitData.unitNumber && unitData.rent) {
      setFormData({ ...formData, units: [...formData.units, unitData] });
      setUnitData({ unitNumber: '', bedrooms: 1, bathrooms: 1, squareFeet: '', rent: '' });
    }
  };

  const removeUnit = (index) => {
    const updated = formData.units.filter((_, i) => i !== index);
    setFormData({ ...formData, units: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.units.length === 0) {
      return alert('Please add at least one unit to the property');
    }
    try {
      await createProperty(formData);
      alert('Property created successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        address: { street: '', city: '', district: '', country: 'Rwanda' },
        propertyType: '',
        units: []
      });
      fetchProperties();
    } catch (err) {
      console.error('Property creation error:', err);
      alert(`Failed to create property: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        fetchProperties();
      } catch (err) {
        console.error(err);
      }
    }
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
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Properties</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Manage your rental assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: brandColor }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-none"
        >
          <Plus size={20} />
          <span>Add Property</span>
        </button>
      </div>

      {/* Grid Content */}
      {properties.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Building2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No properties yet</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Get started by listing your first apartment, house, or commercial space.</p>
          <button
            onClick={() => setShowModal(true)}
            style={{ color: brandColor }}
            className="font-bold hover:underline underline-offset-4"
          >
            Add your first property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all hover:border-[#54ab91]">
              {/* Card Header Overlay style */}
              <div className="p-6 pb-4 border-b border-slate-50">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#54ab91] transition-colors line-clamp-1">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <MapPin size={12} />
                      <span className="truncate">{property.address.street}, {property.address.city}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {property.propertyType}
                  </span>
                </div>
              </div>

              {/* Card Summary Stats */}
              <div className="p-6 grid grid-cols-3 gap-2 text-center bg-slate-50/30">
                <div>
                  <p className="text-lg font-black text-slate-900">{property.units.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Units</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-500">
                    {property.units.filter(u => u.status === 'occupied').length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Occupied</p>
                </div>
                <div>
                  <p className="text-lg font-black text-amber-500">
                    {property.units.filter(u => u.status === 'vacant').length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vacant</p>
                </div>
              </div>

              {/* Tenants List */}
              {property.units.some(u => u.status === 'occupied' && u.tenant) && (
                <div className="px-6 pb-4 border-b border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Tenants</p>
                  <div className="space-y-2">
                    {property.units
                      .filter(u => u.status === 'occupied' && u.tenant)
                      .map((unit, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-600">Unit {unit.unitNumber}</span>
                          <span className="font-bold text-slate-900">{unit.tenant.name}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Card Actions */}
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => navigate(`/landlord/properties/${property._id}`)}
                  className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#54ab91] hover:text-white transition-all active:scale-95"
                >
                  <ExternalLink size={16} /> Details
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Property</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Property Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Kigali Heights" required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Property Type</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Street Address</label>
                    <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} placeholder="KG 101 St" required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">City</label>
                    <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="Kigali" required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">District</label>
                    <input type="text" name="address.district" value={formData.address.district} onChange={handleChange} placeholder="Gasabo"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Units Section */}
                <div className="pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Plus size={18} className="text-[#54ab91]" strokeWidth={3} />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Add Units</h4>
                  </div>

                  {/* Add Unit Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 bg-slate-50 p-4 rounded-3xl">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Number</label>
                      <input type="text" name="unitNumber" value={unitData.unitNumber} onChange={handleUnitChange} placeholder="101"
                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Beds</label>
                      <input type="number" name="bedrooms" value={unitData.bedrooms} onChange={handleUnitChange}
                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Baths</label>
                      <input type="number" name="bathrooms" value={unitData.bathrooms} onChange={handleUnitChange}
                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rent</label>
                      <input type="number" name="rent" value={unitData.rent} onChange={handleUnitChange} placeholder="RWF"
                        className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={addUnit} style={{ backgroundColor: brandColor }}
                        className="w-full py-2.5 text-white rounded-xl active:scale-95 transition-transform flex items-center justify-center"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Units List */}
                  <div className="space-y-2">
                    {formData.units.map((unit, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-[#54ab91]/5 border border-[#54ab91]/10 rounded-2xl group transition-all">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                          <span className="text-[#54ab91] px-2 py-1 bg-white rounded-lg border border-[#54ab91]/20">#{unit.unitNumber}</span>
                          <div className="flex items-center gap-1"><Bed size={14} className="text-slate-400" /> {unit.bedrooms}</div>
                          <div className="flex items-center gap-1"><Bath size={14} className="text-slate-400" /> {unit.bathrooms}</div>
                          <div className="flex items-center gap-1"><Banknote size={14} className="text-slate-400" /> {unit.rent} RWF</div>
                        </div>
                        <button type="button" onClick={() => removeUnit(index)} className="text-slate-300 hover:text-red-500 p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/20">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSubmit} style={{ backgroundColor: brandColor }}
                className="flex-1 py-4 text-sm font-bold text-white rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#54ab91]/20"
              >
                Create Property
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default Properties;