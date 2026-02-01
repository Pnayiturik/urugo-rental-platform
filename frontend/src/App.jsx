import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandlordLayout from './layouts/LandlordLayout';
import LandlordHome from './pages/landlord/Home';
import Properties from './pages/landlord/Properties';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

const RedirectIfAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) {
    return <Navigate to={user.role === 'landlord' ? '/landlord' : '/tenant'} />;
  }

  return children;
};

const TenantTemp = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gray-100)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-lg)'
    }}>
      <h1 style={{ color: 'var(--primary-purple)' }}>🏠 Tenant Dashboard</h1>
      <p style={{ color: 'var(--gray-600)' }}>
        Welcome, {user.firstName} {user.lastName}
      </p>
      <button
        onClick={logout}
        style={{
          background: 'var(--error-red)',
          color: 'white',
          padding: 'var(--space-sm) var(--space-xl)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          } />

          <Route path="/register" element={
            <RedirectIfAuth>
              <Register />
            </RedirectIfAuth>
          } />

          {/* Landlord Routes */}
          <Route path="/landlord" element={
            <ProtectedRoute role="landlord">
              <LandlordLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LandlordHome />} />
            <Route path="properties" element={<Properties />} />
          </Route>

          {/* Tenant Routes */}
          <Route path="/tenant" element={
            <ProtectedRoute role="tenant">
              <TenantTemp />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;