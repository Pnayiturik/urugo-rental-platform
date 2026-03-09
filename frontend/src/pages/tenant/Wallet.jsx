import React, { useEffect, useRef, useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  History,
  CheckCircle,
  XCircle,
  CreditCard,
  Smartphone,
  Banknote,
  RefreshCw
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
//  Helper – auth header
// ─────────────────────────────────────────────────────────
const getAuthConfig = () => {
  const raw    = localStorage.getItem('userInfo');
  const parsed = raw ? JSON.parse(raw) : {};
  const token  = parsed?.firstLoginToken || parsed?.token || parsed?.accessToken ||
                 parsed?.user?.token || localStorage.getItem('token') || '';
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ─────────────────────────────────────────────────────────
//  Default/empty Flutterwave config (hook must be called
//  unconditionally, so we need a placeholder on first render)
// ─────────────────────────────────────────────────────────
const EMPTY_CONFIG = {
  public_key:      import.meta.env.VITE_FLW_PUBLIC_KEY || '',
  tx_ref:          'URUGO-INIT',
  amount:          1,
  currency:        'RWF',
  payment_options: 'card,mobilemoneyrwanda,banktransfer',
  customer:        { email: 'noop@urugo.rw', name: 'Urugo User', phone_number: '' },
  customizations:  { title: 'Urugo Rental Platform', description: 'Rent Payment', logo: '' }
};

// ─────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────
const Wallet = () => {
  const { user } = useAuth();

  const [lease,         setLease]         = useState(null);
  const [payments,      setPayments]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [processing,    setProcessing]    = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'canceled' | null
  const [statusMsg,     setStatusMsg]     = useState('');
  const [paymentFor,    setPaymentFor]    = useState('rent');
  const [topupAmount,   setTopupAmount]   = useState('');

  // Holds the latest Flutterwave config returned by the backend
  const [flwConfig, setFlwConfig] = useState(EMPTY_CONFIG);

  // Ref flag: fire the Flutterwave modal after config state update
  const triggerPayRef = useRef(false);

  // ── Flutterwave hook (always called at top level) ─────────────────────────
  const handleFlutterPayment = useFlutterwave(flwConfig);

  // Fire the modal as soon as a fresh config lands
  useEffect(() => {
    if (!triggerPayRef.current) return;
    if (flwConfig.tx_ref === 'URUGO-INIT' || flwConfig.amount <= 1) return;

    triggerPayRef.current = false;

    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          try {
            await api.post(
              '/payments/flutterwave/verify',
              { transaction_id: response.transaction_id, tx_ref: response.tx_ref },
              getAuthConfig()
            );
            setPaymentStatus('success');
            setStatusMsg('Your payment was successful! A receipt has been generated.');
            fetchPayments();
          } catch (err) {
            setPaymentStatus('success');
            setStatusMsg('Payment received. Verification is being processed in the background.');
          }
        } else {
          setPaymentStatus('canceled');
          setStatusMsg('The payment was not completed. Please try again.');
        }
        setProcessing(false);
        setTimeout(() => setPaymentStatus(null), 8000);
      },
      onClose: () => {
        setProcessing(false);
      }
    });
  }, [flwConfig]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments/tenant', getAuthConfig());
      setPayments(res.data.payments || []);
    } catch (_) {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [leaseRes] = await Promise.all([
          api.get('/leases/my-lease', getAuthConfig()),
          fetchPayments()
        ]);
        setLease(leaseRes.data.lease);
      } catch (err) {
        console.error('Failed to load wallet data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Initiate payment ──────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!lease && paymentFor !== 'topup') {
      alert('No active lease found.');
      return;
    }
    if (paymentFor === 'topup' && (!topupAmount || Number(topupAmount) <= 0)) {
      alert('Please enter a valid top-up amount.');
      return;
    }

    setProcessing(true);

    try {
      const body = { paymentFor };
      if (paymentFor === 'topup') body.amount = Number(topupAmount);

      const res = await api.post('/payments/flutterwave/init', body, getAuthConfig());

      if (!res.data.success) {
        alert(res.data.message || 'Could not initialise payment.');
        setProcessing(false);
        return;
      }

      // Update config state → useEffect picks it up and fires the modal
      triggerPayRef.current = true;
      setFlwConfig(res.data.config);
    } catch (err) {
      alert(`Payment error: ${err.response?.data?.message || err.message}`);
      setProcessing(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const paymentLabel = () => {
    if (processing) return 'Opening payment window…';
    switch (paymentFor) {
      case 'deposit': return 'Pay Security Deposit';
      case 'topup':   return 'Top Up Wallet';
      default:        return 'Pay Rent Now';
    }
  };

  const dueAmount = () => {
    if (paymentFor === 'deposit') return lease?.propertyId?.cautionFee || 0;
    if (paymentFor === 'topup')   return Number(topupAmount) || 0;
    return lease?.rentAmount || 0;
  };

  const recentPayments = payments.slice(0, 5);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <WalletIcon className="text-[#54ab91]" /> My Wallet
      </h1>

      {/* Status banner */}
      {paymentStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Payment Successful!</p>
            <p className="text-sm mt-1">{statusMsg}</p>
          </div>
        </div>
      )}
      {paymentStatus === 'canceled' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-start gap-3">
          <XCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Payment Not Completed</p>
            <p className="text-sm mt-1">{statusMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Main payment card ───────────────────────────────────────────── */}
        <div className="md:col-span-2 bg-[#54ab91] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            {/* Payment type selector */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'rent',    label: 'Rent',    icon: <Banknote size={14}/> },
                { id: 'deposit', label: 'Deposit', icon: <CreditCard size={14}/> },
                { id: 'topup',   label: 'Top-up',  icon: <Smartphone size={14}/> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setPaymentFor(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    paymentFor === t.id
                      ? 'bg-white text-[#54ab91]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Amount display */}
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                {paymentFor === 'rent'    && 'Monthly Rent Due'}
                {paymentFor === 'deposit' && 'Security Deposit'}
                {paymentFor === 'topup'   && 'Top-up Amount'}
              </p>
              {paymentFor === 'topup' ? (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount (RWF)"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  className="mt-2 w-full bg-white/20 placeholder-white/60 text-white text-2xl font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-white/40"
                />
              ) : (
                <h2 className="text-4xl font-bold mt-2">
                  {loading ? '…' : `${dueAmount().toLocaleString()} RWF`}
                </h2>
              )}
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={processing || loading || (!lease && paymentFor !== 'topup')}
              className="bg-white text-[#54ab91] px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <><RefreshCw size={16} className="animate-spin" /> Opening payment window…</>
              ) : (
                <>{paymentLabel()} <ArrowUpRight size={18} /></>
              )}
            </button>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-4 -top-8 w-24 h-24 bg-white/5 rounded-full" />
        </div>

        {/* ── Lease info card ─────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <History size={18} /> Lease Info
          </h3>
          {[
            { label: 'Unit',    value: lease?.unitNumber || '—' },
            { label: 'Rent',    value: lease ? `${(lease.rentAmount||0).toLocaleString()} RWF` : '—' },
            { label: 'Deposit', value: lease?.propertyId?.cautionFee ? `${lease.propertyId.cautionFee.toLocaleString()} RWF` : '—' },
            { label: 'Status',  value: (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                {lease ? 'Active' : 'No Lease'}
              </span>
            )}
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">{row.label}</span>
              <span className="text-slate-700 font-medium text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Accepted payment methods ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-600 mb-3">Accepted via Flutterwave</p>
        <div className="flex flex-wrap gap-3">
          {[
            { icon: <CreditCard size={16} />, label: 'Visa / Mastercard' },
            { icon: <Smartphone size={16} />, label: 'MTN Mobile Money' },
            { icon: <Smartphone size={16} />, label: 'Airtel Money' },
            { icon: <Banknote size={16} />,   label: 'Bank Transfer' }
          ].map(m => (
            <span key={m.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
              {m.icon} {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Recent transactions ──────────────────────────────────────────── */}
      {recentPayments.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">Recent Transactions</h3>
          <div className="divide-y divide-slate-50">
            {recentPayments.map(p => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {p.paymentFor} – {p.paymentMonth || '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">
                    {(p.amount||0).toLocaleString()} RWF
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    p.status === 'completed' ? 'bg-green-100 text-green-700' :
                    p.status === 'failed'    ? 'bg-red-100 text-red-700' :
                    p.status === 'overdue'   ? 'bg-red-100 text-red-700' :
                                               'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
