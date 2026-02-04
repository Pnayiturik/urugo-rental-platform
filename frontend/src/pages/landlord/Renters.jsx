import { useState, useEffect } from 'react';
import { getTenants, deleteTenant } from '../../services/tenantService';

function Renters() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data.tenants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      try {
        await deleteTenant(id);
        fetchTenants();
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
          Renters
        </h2>
      </div>

      {/* Renters List */}
      {tenants.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3xl)',
          textAlign: 'center',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>👥</p>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-md)' }}>
            No renters yet
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)' }}>
            Assign tenants to units to see them here
          </p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr 100px',
            gap: 'var(--space-md)',
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--gray-50)',
            borderBottom: '1px solid var(--gray-200)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--gray-600)',
            textTransform: 'uppercase'
          }}>
            <div>Tenant</div>
            <div>Property</div>
            <div>Unit</div>
            <div>Rent</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          {tenants.map((tenant) => (
            <div key={tenant._id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr 100px',
              gap: 'var(--space-md)',
              padding: 'var(--space-md) var(--space-lg)',
              borderBottom: '1px solid var(--gray-100)',
              alignItems: 'center'
            }}>
              {/* Tenant Info */}
              <div>
                <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--gray-900)', fontSize: 'var(--font-size-sm)' }}>
                  {tenant.userId?.firstName} {tenant.userId?.lastName}
                </p>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                  {tenant.userId?.email}
                </p>
              </div>

              {/* Property */}
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                  {tenant.propertyId?.name || 'N/A'}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                  {tenant.propertyId?.address?.city}
                </p>
              </div>

              {/* Unit */}
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                  Unit {tenant.unitId || 'N/A'}
                </p>
              </div>

              {/* Rent */}
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-purple)' }}>
                  ${tenant.rentAmount}
                </p>
              </div>

              {/* Status */}
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  textTransform: 'capitalize',
                  background: tenant.status === 'active' ? '#ECFDF5' : '#FEF3C7',
                  color: tenant.status === 'active' ? 'var(--success-green)' : 'var(--warning-yellow-dark)'
                }}>
                  {tenant.status}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  onClick={() => handleDelete(tenant._id)}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--error-red)',
                    background: 'transparent',
                    color: 'var(--error-red)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-xs)'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Renters;