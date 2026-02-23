import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Building2, Users, Receipt, FileText, 
  Wallet, LogOut, ChevronLeft, ChevronRight, Menu, X 
} from 'lucide-react';

const landlordLinks = [
  { name: 'Home', icon: Home, path: '/landlord' },
  { name: 'Properties', icon: Building2, path: '/landlord/properties' },
  { name: 'Leases', icon: FileText, path: '/landlord/leases' }, 
  { name: 'Renters', icon: Users, path: '/landlord/renters' },
  { name: 'Transactions', icon: Receipt, path: '/landlord/transactions' },
  { name: 'Documents', icon: FileText, path: '/landlord/documents' },
];

const tenantLinks = [
  { name: 'Home', icon: Home, path: '/tenant' },
  { name: 'My Lease', icon: FileText, path: '/tenant/lease' },
  { name: 'Transactions', icon: Receipt, path: '/tenant/transactions' },
  { name: 'Wallet', icon: Wallet, path: '/tenant/wallet' },
  { name: 'Documents', icon: FileText, path: '/tenant/documents' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandColor = '#54ab91';
  const links = user?.role === 'landlord' ? landlordLinks : tenantLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-4 flex items-center justify-between z-[60]">
        <img src="/logo.png" alt="Urugo" className="h-8 w-auto" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-[55] lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        style={{ backgroundColor: brandColor }}
        className={`fixed left-0 top-0 bottom-0 z-[58] flex flex-col text-white transition-all duration-300 ease-in-out shadow-xl shadow-[#54ab91]/20
          ${collapsed ? 'w-20' : 'w-64'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Desktop Logo Section */}
        <div className="hidden lg:flex h-20 items-center justify-between px-6 border-b border-white/10">
          {!collapsed && (
            <img 
              src="/logo.png" 
              alt="Urugo" 
              className="h-8 w-auto brightness-0 invert" // Forces logo to white
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 pt-20 lg:pt-6 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white text-[#54ab91] shadow-lg shadow-black/5' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className={`text-sm font-bold whitespace-nowrap ${collapsed && 'lg:hidden'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-black/5">
          <div className={`flex items-center gap-3 p-2 rounded-xl mb-2 ${collapsed && 'lg:justify-center'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#54ab91] shrink-0 font-bold text-xs">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-white/70 hover:text-white hover:bg-red-500/20 rounded-xl transition-all ${collapsed && 'lg:justify-center'}`}
          >
            <LogOut size={20} />
            {(!collapsed || mobileOpen) && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Custom scrollbar to keep it clean against the brand color */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}

export default Sidebar;