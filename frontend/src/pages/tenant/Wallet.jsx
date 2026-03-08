import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, ArrowUpRight, History, CheckCircle, XCircle } from 'lucide-react';

const Wallet = () => {
  const { user } = useAuth();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'canceled', or null
  const [processing, setProcessing] = useState(false);
  const [gateway, setGateway] = useState('stripe'); // stripe | flutterwave

  const getAuthToken = () => {
    const raw = localStorage.getItem('userInfo');
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed?.firstLoginToken || parsed?.token || parsed?.accessToken || parsed?.user?.token || localStorage.getItem('token') || '';
  };

  const authConfig = () => {
    const token = getAuthToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        console.log('Fetching lease data...');
        const res = await api.get('/leases/my-lease', authConfig());
        console.log('Lease API response:', res.data);
        setLease(res.data.lease);
        if (res.data.lease) {
          console.log('Rent amount:', res.data.lease.rentAmount);
        }
      } catch (error) {
        console.error("Could not fetch lease details for payment", error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaseData();

    // Check for payment status in URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    // Stripe callback
    if (success === 'true' && sessionId) {
      setPaymentStatus('success');
      verifyPayment(sessionId);
      window.history.replaceState({}, document.title, '/tenant/wallet');
    } else if (canceled === 'true') {
      setPaymentStatus('canceled');
      window.history.replaceState({}, document.title, '/tenant/wallet');
      setTimeout(() => setPaymentStatus(null), 5000); // Clear message after 5s
    }

    // Flutterwave callback
    const fwStatus = urlParams.get('status');
    const fwTxId = urlParams.get('transaction_id');

    if (fwStatus === 'successful' && fwTxId) {
      setPaymentStatus('success');
      verifyFlutterwave(fwTxId);
      window.history.replaceState({}, document.title, '/tenant/wallet');
    } else if (canceled === 'true' || fwStatus === 'cancelled') {
      setPaymentStatus('canceled');
      window.history.replaceState({}, document.title, '/tenant/wallet');
      setTimeout(() => setPaymentStatus(null), 5000);
    }
  }, []);

  const verifyPayment = async (sessionId) => {
    try {
      const res = await api.get(`/payments/verify-stripe/${sessionId}`, authConfig());
      if (res.data.success) {
        console.log('Payment verified:', res.data);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  const verifyFlutterwave = async (transactionId) => {
    try {
      await api.get(`/payments/flutterwave/verify?transaction_id=${transactionId}`, authConfig());
    } catch (error) {
      console.error('Flutterwave verification failed:', error);
    }
  };

  const handlePayment = async () => {
    console.log('=== Stripe Payment Button Clicked ===');
    console.log('Lease data:', lease);
    console.log('User data:', user);

    if (!lease) {
      alert("No active lease found to pay for.");
      return;
    }

    if (!user?.email) {
      alert("User email is missing. Please logout and login again.");
      console.error("User email not found:", user);
      return;
    }

    setProcessing(true);

    try {
      const endpoint = gateway === 'stripe'
        ? '/payments/create-stripe-session'
        : '/payments/create-flutterwave-session';

      const res = await api.post(endpoint, authConfig());
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
        return;
      }
      alert('Failed to initialize payment. Please try again.');
    } catch (error) {
      alert(`Payment error: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <WalletIcon className="text-[#54ab91]" /> My Wallet
      </h1>

      {/* Payment Status Messages */}
      {paymentStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Payment Successful!</p>
            <p className="text-sm mt-1">Your rent payment has been received and a receipt has been generated.</p>
          </div>
        </div>
      )}

      {paymentStatus === 'canceled' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-start gap-3">
          <XCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Payment Canceled</p>
            <p className="text-sm mt-1">You canceled the payment. You can try again when ready.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-[#54ab91] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Current Rent Due</p>
            <h2 className="text-4xl font-bold mt-2">
              {loading ? "..." : `${lease?.rentAmount || 0} RWF`}
            </h2>
            <button 
              onClick={handlePayment}
              disabled={processing || loading || !lease}
              className="mt-8 bg-white text-[#54ab91] px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? `Redirecting to ${gateway === 'stripe' ? 'Stripe' : 'Flutterwave'}...` : 'Pay Rent Now'} <ArrowUpRight size={18} />
            </button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
        </div>

        {/* Quick Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <History size={18} /> Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Status</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Unit</span>
              <span className="text-slate-700 font-medium">{lease?.unitNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs text-slate-500 block mb-2">Payment Method</label>
        <select
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          className="px-4 py-2 rounded-lg text-slate-800 font-medium"
        >
          <option value="stripe">Card (Stripe)</option>
          <option value="flutterwave">Mobile Money/Card (Flutterwave)</option>
        </select>
      </div>
    </div>
  );
};

export default Wallet;