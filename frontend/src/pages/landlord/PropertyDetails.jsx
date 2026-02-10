import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../../services/propertyService';
import { createTenant } from '../../services/tenantService';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  UserPlus, 
  Users, 
  Home as HomeIcon, 
  CheckCircle2, 
  X, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  Info
} from 'lucide-react';

/**
 * Urugo Rental - Modern Property Details & Tenant Assignment
 * Features: Tailwind CSS, Responsive Grids, Brand Color #54ab91
 */

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
    emergencyContact: { name: '', phone: '', relationship: '' }
  });
  const [error, setError] = useState('');

  const brandColor = '#54ab91';

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await getPropertyById(id);
      setProperty(data.property);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      leaseStart: '',
      leaseEnd: '',
      emergencyContact: { name: '', phone: '', relationship: '' }
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData({ 
        ...formData, 
        emergencyContact: { ...formData.emergencyContact, [field]: value } 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await createTenant({
        ...formData,
        propertyId: property._id,
        unitId: selectedUnit._id,
        rentAmount: selectedUnit.rent,
      });

      alert(`Tenant created! Temporary password: ${response.tempPassword}\n\nLogin details have been emailed to the tenant.`);
      setShowModal(false);
      fetchProperty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tenant');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-[#54ab91]" size={40} />
    </div>
  );

  if (!property) return <div className="p-20 text-center text-slate-500 font-bold">Property not found</div>;

  const occupiedUnits = property.units.filter(u => u.status === 'occupied').length;
  const vacantUnits = property.units.filter(u => u.status === 'vacant').length;
  const occupancyRate = property.units.length > 0 ? Math.round((occupiedUnits / property.units.length) * 100) : 0;

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Section */}
      <div className="space-y-6">
        <button
          onClick={() => navigate('/landlord/properties')}
          className="flex items-center gap-2 text-[#54ab91] font-bold text-sm hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={18} /> Back to Properties
        </button>

        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{property.name}</h2>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <MapPin size={18} />
              <span>{property.address.street}, {property.address.city}</span>
            </div>
          </div>
          <div className="px-6 py-2 bg-[#54ab91] text-white rounded-full text-xs font-black uppercase tracking-widest">
            {property.propertyType}
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: property.units.length, color: 'text-slate-900', icon: <Building2 size={20} /> },
          { label: 'Occupied', value: occupiedUnits, color: 'text-emerald-500', icon: <CheckCircle2 size={20} /> },
          { label: 'Vacant', value: vacantUnits, color: 'text-amber-500', icon: <HomeIcon size={20} /> },
          { label: 'Occupancy', value: `${occupancyRate}%`, color: 'text-[#54ab91]', icon: <Users size={20} /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl">
            <div className="p-2 w-fit rounded-xl bg-slate-50 text-slate-400 mb-4">{stat.icon}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Units Management */}
      <div className="bg-white border border-slate-100 p-6 lg:p-10 rounded-[2.5rem]">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Units Management</h3>
        
        {property.units.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-medium">
            No units found for this property.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {property.units.map((unit, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-3xl border transition-all ${
                  unit.status === 'occupied' 
                  ? 'bg-slate-50 border-transparent opacity-80' 
                  : 'bg-white border-slate-100 hover:border-[#54ab91]'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Unit {unit.unitNumber}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {unit.bedrooms} BD • {unit.bathrooms} BA
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    unit.status === 'occupied' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-2xl font-black text-slate-900">{unit.rent.toLocaleString()} RWF</span>
                  <span className="text-slate-400 text-sm font-bold ml-1">/ mo</span>
                </div>

                <button
                  onClick={() => unit.status === 'vacant' ? handleAssignClick(unit) : null}
                  className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${
                    unit.status === 'vacant'
                    ? 'bg-[#54ab91] text-white hover:brightness-95 active:scale-95'
                    : 'bg-white border border-slate-200 text-slate-400 cursor-default'
                  }`}
                >
                  {unit.status === 'vacant' ? 'Assign Tenant' : 'View Lease'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assign Tenant</h3>
                <p className="text-xs font-bold text-[#54ab91] uppercase tracking-widest mt-1">Unit {selectedUnit?.unitNumber} • {selectedUnit?.rent} RWF</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] text-sm font-medium transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] text-sm font-medium transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tenant@urugo.rw" required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] text-sm font-medium transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lease Start</label>
                    <input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] text-sm font-medium transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lease End</label>
                    <input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] text-sm font-medium transition-all" />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3">
                  <Info size={18} className="text-amber-600 mt-1 shrink-0" />
                  <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                    Assigning a tenant will auto-generate an account and send login instructions via email.
                  </p>
                </div>

                <button 
                  type="submit" 
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-4 text-white font-black rounded-2xl active:scale-95 transition-all uppercase tracking-widest text-sm shadow-xl shadow-[#54ab91]/20"
                >
                  Create & Send Invite
                </button>
              </form>
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

export default PropertyDetails;