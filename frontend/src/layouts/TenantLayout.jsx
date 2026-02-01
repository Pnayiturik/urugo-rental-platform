import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

function TenantLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '240px',
        minHeight: '100vh',
        background: 'var(--gray-100)'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'var(--info-blue)',
          padding: 'var(--space-xs) var(--space-xl)',
          fontSize: 'var(--font-size-sm)',
          color: 'white',
          textAlign: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)'
        }}>
          Welcome to Urugo Rental Platform
        </div>

        {/* Page Content */}
        <div style={{
          padding: 'var(--space-xl)'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default TenantLayout;