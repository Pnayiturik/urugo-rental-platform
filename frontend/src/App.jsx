import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';

import LandlordLayout from './layouts/LandlordLayout';
import TenantLayout from './layouts/TenantLayout';

import LandlordHome from './pages/landlord/Home';
import LandlordProperties from './pages/landlord/Properties';
import LandlordPropertyDetails from './pages/landlord/PropertyDetails';
import LandlordDocuments from './pages/landlord/Documents';
import LandlordLeases from './pages/landlord/Leases';
import LandlordTransactions from './pages/landlord/Transactions';
import LandlordRenters from './pages/landlord/Renters';
import LandlordRequestsInbox from './pages/landlord/RequestsInbox';

import TenantHome from './pages/tenant/Home';
import TenantProperties from './pages/tenant/Properties';
import PropertyDetail from './pages/tenant/PropertyDetail';
import TenantDocuments from './pages/tenant/Documents';
import TenantLease from './pages/tenant/TenantLease';
import TenantTransactions from './pages/tenant/Transactions';
import TenantRequests from './pages/tenant/Requests';
import Wallet from './pages/tenant/Wallet';
import PublicProperties from './pages/PublicProperties'; 
import PublicPropertyDetail from './pages/PublicPropertyDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="/landlord" element={<LandlordLayout />}>
        <Route index element={<Navigate to="home" replace />} />        
        <Route path="home" element={<LandlordHome />} />
        <Route path="properties" element={<LandlordProperties />} />
        <Route path="properties/:id" element={<LandlordPropertyDetails />} />
        <Route path="documents" element={<LandlordDocuments />} />
        <Route path="leases" element={<LandlordLeases />} />
        <Route path="transactions" element={<LandlordTransactions />} />
        <Route path="renters" element={<LandlordRenters />} />
        <Route path="requests" element={<LandlordRequestsInbox />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Route>

      <Route path="/tenant" element={<TenantLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<TenantHome />} />
        <Route path="properties" element={<TenantProperties />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="requests" element={<TenantRequests />} />
        <Route path="documents" element={<TenantDocuments />} />
        <Route path="lease" element={<TenantLease />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="transactions" element={<TenantTransactions />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Route>

      {/* Public property browsing (no sidebar) */}
      <Route path="/properties" element={<PublicProperties />} />
      <Route path="/properties/:id" element={<PublicPropertyDetail />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;