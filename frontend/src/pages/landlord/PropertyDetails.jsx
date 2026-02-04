import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../../services/propertyService';
import { createTenant } from '../../services/tenantService';

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
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [error, setError] = useState('');

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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        propertyId: property._id,
        unitId: selectedUnit._id,
        leaseStart: formData.leaseStart,
        leaseEnd: formData.leaseEnd,
        rentAmount: selectedUnit.rent,
        emergencyContact: formData.emergencyContact
      });

      alert(`Tenant created! Temporary password: ${response.tempPassword}\n\nThis will be sent via email.`);
      setShowModal(false);
      fetchProperty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tenant');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>Loading...</div>;
  }

  if (!property) {
    return <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>Property not found</div>;
  }

  const occupiedUnits = property.units.filter(u => u.status === 'occupied').length;
  const vacantUnits = property.units.filter(u => u.status === 'vacant').length;
  const occupancyRate = property.units.length > 0 ? Math.round((occupiedUnits / property.units.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <button
          onClick={() => navigate('/landlord/properties')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--primary-purple)',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)'
          }}
        >
          ← Back to Properties
        </button>

        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--gray-900)', marginBottom: 'var(--space-xs)' }}>
                {property.name}
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-base)' }}>
                📍 {property.address.street}, {property.address.city}
                {property.address.district && `, ${property.address.district}`}
              </p>
            </div>
            <span style={{
              background: 'var(--primary-purple)',
              color: 'white',
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'capitalize'
            }}>
              {property.propertyType}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)'
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
            Total Units
          </p>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)' }}>
            {property.units.length}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)'
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
            Occupied
          </p>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-green)' }}>
            {occupiedUnits}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)'
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
            Vacant
          </p>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-yellow-dark)' }}>
            {vacantUnits}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)'
        }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
            Occupancy Rate
          </p>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--info-blue)' }}>
            {occupancyRate}%
          </p>
        </div>
      </div>

      {/* Units List */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-lg)', color: 'var(--gray-900)' }}>
          Units
        </h3>

        {property.units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>📭</p>
            <p>No units added yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {property.units.map((unit, index) => (
              <div key={index} style={{
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                background: unit.status === 'occupied' ? 'var(--gray-50)' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--gray-900)' }}>
                      Unit {unit.unitNumber}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                      {unit.bedrooms} BR • {unit.bathrooms} BA
                    </p>
                  </div>
                  <span style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    background: unit.status === 'occupied' ? '#ECFDF5' : '#FEF3C7',
                    color: unit.status === 'occupied' ? 'var(--success-green)' : 'var(--warning-yellow-dark)',
                    textTransform: 'capitalize'
                  }}>
                    {unit.status}
                  </span>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)' }}>
                    ${unit.rent}
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', color: 'var(--gray-500)' }}>
                      /month
                    </span>
                  </p>
                </div>

                {unit.status === 'vacant' && (
                  <button
                    onClick={() => handleAssignClick(unit)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--primary-purple)',
                      background: 'transparent',
                      color: 'var(--primary-purple)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)'
                    }}
                  >
                    Assign Tenant
                  </button>
                )}

                {unit.status === 'occupied' && (
                  <button
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-300)',
                      background: 'white',
                      color: 'var(--gray-700)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)'
                    }}
                  >
                    View Tenant
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Tenant Modal */}
      {showModal && selectedUnit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 'var(--space-lg)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'var(--space-xl)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-900)' }}>Create & Invite Tenant</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
                  Unit {selectedUnit.unitNumber} • ${selectedUnit.rent}/mo
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid var(--error-red)',
                color: 'var(--error-red)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Tenant Name */}
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    First Name
                  </label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Last Name
                  </label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@email.com" required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Phone Number
                  </label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+250 700 000 000"
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
              </div>

              {/* Lease Dates */}
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Lease Start
                  </label>
                  <input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Lease End
                  </label>
                  <input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', marginBottom: 'var(--space-sm)', display: 'block' }}>
                  Emergency Contact (Optional)
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <input type="text" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Name"
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                  />
                  <input type="text" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="Phone"
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                  />
                  <input type="text" name="emergencyContact.relationship" value={formData.emergencyContact.relationship} onChange={handleChange} placeholder="Relationship"
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                  />
                </div>
              </div>

              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', background: '#FEF3C7', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                ℹ️ A temporary password will be generated and sent to the tenant via email
              </p>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', background: 'white', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary-purple)', color: 'white', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Create & Invite Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;