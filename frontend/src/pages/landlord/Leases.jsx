import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, DollarSign } from 'lucide-react';
import { getMyLeases, createLease } from '../../services/leaseService';
import { getProperties } from '../../services/propertyService';

const Leases = () => {
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tenantEmail: '',
    tenantFirstName: '',
    tenantLastName: '',
    propertyId: '',
    unitNumber: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    terms: 'Standard Urugo Rental Agreement: Tenant agrees to pay rent on time via MoMo/Airtel. Landlord is responsible for property maintenance and repairs.'
  });

  const fetchLeases = async () => {
    try {
      const data = await getMyLeases();
      setLeases(data.leases || []);
    } catch (error) {
      console.error('Error fetching leases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    fetchLeases();
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📝 Creating lease with data:', formData);
      console.log('📄 Terms field:', formData.terms);
      await createLease(formData);
      alert('Lease created successfully! Tenant invitation sent.');
      setShowModal(false);
      fetchLeases();
      setFormData({
        tenantEmail: '',
        tenantFirstName: '',
        tenantLastName: '',
        propertyId: '',
        unitNumber: '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        terms: 'Standard Urugo Rental Agreement: Tenant agrees to pay rent on time via MoMo/Airtel. Landlord is responsible for property maintenance and repairs.'
      });
    } catch (error) {
      console.error('Error creating lease:', error);
      alert(`Failed to create lease: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-[#54ab91]" /> Lease Agreements
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#54ab91] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#488c77] transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> New Lease
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading leases...</div>
      ) : leases.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No leases yet. Create your first lease agreement.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Tenant</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Property</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Rent</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leases.map((lease) => (
                <tr key={lease._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900">
                    {lease.tenantId 
                      ? `${lease.tenantId.firstName} ${lease.tenantId.lastName}` 
                      : 'Invited Tenant'}
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-medium">
                    {lease.propertyId?.name} (Unit {lease.unitNumber})
                  </td>
                  <td className="px-8 py-6 font-black text-[#54ab91]">
                    {lease.rentAmount?.toLocaleString()} RWF
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                      {lease.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lease Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Lease</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tenant First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantFirstName}
                    onChange={(e) => setFormData({ ...formData, tenantFirstName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tenant Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantLastName}
                    onChange={(e) => setFormData({ ...formData, tenantLastName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tenant Email</label>
                <input
                  type="email"
                  required
                  value={formData.tenantEmail}
                  onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Property</label>
                <select
                  required
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitNumber: '' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                >
                  <option value="">-- Choose a property --</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name} - {property.address.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit Number</label>
                <select
                  required
                  value={formData.unitNumber}
                  onChange={(e) => {
                    const selectedProperty = properties.find(p => p._id === formData.propertyId);
                    const selectedUnit = selectedProperty?.units.find(u => u.unitNumber === e.target.value);
                    console.log('Selected unit:', selectedUnit);
                    setFormData({ 
                      ...formData, 
                      unitNumber: e.target.value,
                      rentAmount: selectedUnit?.rent || ''
                    });
                  }}
                  disabled={!formData.propertyId}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent disabled:bg-slate-100"
                >
                  <option value="">-- Choose a unit --</option>
                  {formData.propertyId && (() => {
                    const selectedProperty = properties.find(p => p._id === formData.propertyId);
                    console.log('Selected property:', selectedProperty);
                    console.log('Available units:', selectedProperty?.units);
                    return selectedProperty?.units.map((unit) => (
                      <option key={unit.unitNumber} value={unit.unitNumber}>
                        Unit {unit.unitNumber} - {unit.bedrooms}BR / {unit.bathrooms}BA - {unit.rent} RWF/month
                        {unit.status === 'occupied' ? ' (Currently Occupied)' : ' (Available)'}
                      </option>
                    ));
                  })()}
                </select>
                {formData.propertyId && properties.find(p => p._id === formData.propertyId)?.units.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">This property has no units. Please add units first.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar size={16} /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar size={16} /> End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <DollarSign size={16} /> Monthly Rent (RWF)
                </label>
                <input
                  type="number"
                  required
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent bg-slate-50"
                  placeholder="Auto-filled from selected unit"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText size={16} /> Lease Terms & Conditions
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#54ab91] focus:border-transparent"
                  placeholder="Enter lease terms, rules, and conditions..."
                />
                <p className="text-xs text-slate-500 mt-1">Include payment terms, rules, maintenance responsibilities, etc.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#54ab91] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#488c77] transition-colors"
                >
                  Create Lease
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leases;