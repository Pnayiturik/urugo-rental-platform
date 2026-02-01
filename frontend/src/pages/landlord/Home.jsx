import { useState, useEffect } from 'react';
import { getProperties } from '../../services/propertyService';

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalUnits = properties.reduce((sum, p) => sum + p.units.length, 0);
  const occupiedUnits = properties.reduce((sum, p) => {
    return sum + p.units.filter(u => u.status === 'occupied').length;
  }, 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const totalRevenue = properties.reduce((sum, p) => {
    return sum + p.units.filter(u => u.status === 'occupied').reduce((s, u) => s + u.rent, 0);
  }, 0);

  const stats = [
    { title: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'This Month', color: 'var(--primary-purple)' },
    { title: 'Units', value: totalUnits, sub: 'Total Units', color: 'var(--info-blue)' },
    { title: 'Occupancy', value: `${occupancyRate}%`, sub: 'Occupied', color: 'var(--success-green)' },
    { title: 'Properties', value: properties.length, sub: 'Total Properties', color: 'var(--accent-yellow)' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <h2 style={{
        fontSize: 'var(--font-size-2xl)',
        color: 'var(--primary-purple)',
        marginBottom: 'var(--space-lg)'
      }}>
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--gray-500)',
              marginBottom: 'var(--space-xs)'
            }}>
              {stat.title}
            </p>
            <p style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: stat.color,
              marginBottom: 'var(--space-xs)'
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--gray-400)'
            }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--gray-900)' }}>
            Recent Activity
          </h3>
        </div>

        {properties.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl)',
            color: 'var(--gray-400)'
          }}>
            <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>📭</p>
            <p>No activity yet. Start by adding a property!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {properties.map((property) => (
              <div key={property._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-lg)'
                }}>
                  🏢
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--gray-900)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    {property.name}
                  </p>
                  <p style={{
                    color: 'var(--gray-500)',
                    fontSize: 'var(--font-size-xs)'
                  }}>
                    {property.address.street}, {property.address.city}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--gray-600)'
                  }}>
                    {property.units.length} unit{property.units.length !== 1 ? 's' : ''}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: '#ECFDF5',
                    color: 'var(--success-green)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;