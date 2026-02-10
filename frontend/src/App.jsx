import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandlordLayout from './layouts/LandlordLayout';
import TenantLayout from './layouts/TenantLayout';
import LandlordHome from './pages/landlord/Home';
import Properties from './pages/landlord/Properties';
import PropertyDetails from './pages/landlord/PropertyDetails';
import Renters from './pages/landlord/Renters';
import Transactions from './pages/landlord/Transactions';
import TenantHome from './pages/tenant/Home';
import LandingPage from './pages/LandingPage';

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage/>} />

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
            <Route path="properties/:id" element={<PropertyDetails />} />
            <Route path="renters" element={<Renters />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>

          {/* Tenant Routes */}
          <Route path="/tenant" element={
            <ProtectedRoute role="tenant">
              <TenantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TenantHome />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;