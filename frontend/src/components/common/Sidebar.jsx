import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const landlordLinks = [
  { name: 'Home', icon: '🏠', path: '/landlord' },
  { name: 'Properties', icon: '', path: '/landlord/properties' },
  { name: 'Renters', icon: '', path: '/landlord/renters' },
  { name: 'Transactions', icon: '', path: '/landlord/transactions' },
  { name: 'Documents', icon: '', path: '/landlord/documents' },
];

const tenantLinks = [
  { name: 'Home', icon: '🏠', path: '/tenant' },
  { name: 'Transactions', icon: '', path: '/tenant/transactions' },
  { name: 'Wallet', icon: '', path: '/tenant/wallet' },
  { name: 'Documents', icon: '', path: '/tenant/documents' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === 'landlord' ? landlordLinks : tenantLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: collapsed ? '80px' : '240px',
      minHeight: '100vh',
      background: 'var(--dark-bg)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width var(--transition-normal)',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 'var(--z-fixed)',
      overflowX: 'hidden'
    }}>
      {/* Logo Section */}
      <div style={{
        padding: 'var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--dark-bg-lighter)'
      }}>
        {!collapsed && (
          <h1 style={{
            color: 'white',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            whiteSpace: 'nowrap'
          }}>
            🏠 <span style={{ color: 'var(--accent-yellow)' }}>Urugo</span>
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: 'var(--gray-400)',
            fontSize: 'var(--font-size-lg)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-xs)'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{
        flex: 1,
        padding: 'var(--space-md) 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)'
      }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-lg)',
                color: isActive ? 'white' : 'var(--gray-400)',
                background: isActive ? 'var(--primary-purple)' : 'transparent',
                borderRadius: isActive ? '0 var(--radius-lg) var(--radius-lg) 0' : '0',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                transition: 'var(--transition-fast)',
                whiteSpace: 'nowrap',
                marginRight: 'var(--space-md)'
              }}
            >
              <span style={{ fontSize: 'var(--font-size-lg)', minWidth: '20px', textAlign: 'center' }}>
                {link.icon}
              </span>
              {!collapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div style={{
        borderTop: '1px solid var(--dark-bg-lighter)',
        padding: 'var(--space-md)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-sm)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            flexShrink: 0
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                color: 'white',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{
                color: 'var(--gray-500)',
                fontSize: 'var(--font-size-xs)',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            color: 'var(--gray-400)',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;