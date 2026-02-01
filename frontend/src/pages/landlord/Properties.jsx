import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties, createProperty, deleteProperty } from '../../services/propertyService';

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
    try {
      await createProperty(formData);
      setShowModal(false);
      setFormData({
        name: '',
        address: { street: '', city: '', district: '', country: 'Rwanda' },
        propertyType: '',
        units: []
      });
      fetchProperties();
    } catch (err) {
      console.error(err);
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
    return <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--primary-purple)' }}>
          Properties
        </h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'var(--primary-purple)',
            color: 'white',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)'
          }}
        >
          + Add Property
        </button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3xl)',
          textAlign: 'center',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>🏢</p>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-md)' }}>
            No properties yet
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'var(--primary-purple)',
              color: 'white',
              padding: 'var(--space-sm) var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {properties.map((property) => (
            <div key={property._id} style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--gray-200)'
            }}>
              {/* Card Header */}
              <div style={{
                background: 'var(--gradient-primary)',
                padding: 'var(--space-lg)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                      {property.name}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, marginTop: 'var(--space-xs)' }}>
                      {property.address.street}, {property.address.city}
                    </p>
                  </div>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    textTransform: 'capitalize'
                  }}>
                    {property.propertyType}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-md)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)' }}>
                      {property.units.length}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Units</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-green)' }}>
                      {property.units.filter(u => u.status === 'occupied').length}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Occupied</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-yellow-dark)' }}>
                      {property.units.filter(u => u.status === 'vacant').length}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Vacant</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button
                    onClick={() => navigate(`/landlord/properties/${property._id}`)}
                    style={{
                      flex: 1,
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
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(property._id)}
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--error-red)',
                      background: 'transparent',
                      color: 'var(--error-red)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showModal && (
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
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'var(--space-xl)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-900)' }}>Add New Property</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Property Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>Property Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Central Park Apartments" required
                  style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                />
              </div>

              {/* Property Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} required
                  style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)', background: 'white' }}
                >
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {/* Street Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>Street Address</label>
                <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} placeholder="e.g. 123 Main Street" required
                  style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                />
              </div>

              {/* City & District */}
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>City</label>
                  <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="e.g. Kigali" required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>District</label>
                  <input type="text" name="address.district" value={formData.address.district} onChange={handleChange} placeholder="e.g. Gasabo"
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
              </div>

              {/* Add Units Section */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)', marginBottom: 'var(--space-sm)', display: 'block' }}>
                  Add Units
                </label>

                {/* Unit Input Row with Labels */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Unit Number</label>
                    <input type="text" name="unitNumber" value={unitData.unitNumber} onChange={handleUnitChange} placeholder="e.g. 101"
                      style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>
                  <div style={{ width: '75px', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Bedrooms</label>
                    <input type="number" name="bedrooms" value={unitData.bedrooms} onChange={handleUnitChange}
                      style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>
                  <div style={{ width: '75px', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Bathrooms</label>
                    <input type="number" name="bathrooms" value={unitData.bathrooms} onChange={handleUnitChange}
                      style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>
                  <div style={{ width: '90px', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Rent ($)</label>
                    <input type="number" name="rent" value={unitData.rent} onChange={handleUnitChange}
                      style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'transparent' }}>.</label>
                    <button type="button" onClick={addUnit}
                      style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success-green)', color: 'white', cursor: 'pointer', fontSize: 'var(--font-size-lg)' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Units List */}
                {formData.units.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                    {formData.units.map((unit, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-200)'
                      }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                          Unit {unit.unitNumber} • {unit.bedrooms}BR • {unit.bathrooms}BA • ${unit.rent}/mo
                        </span>
                        <button type="button" onClick={() => removeUnit(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--error-red)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Properties;