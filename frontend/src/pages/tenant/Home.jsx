import React, { useState, useEffect } from 'react';
import { getTenantPayments, processPayment } from '../../services/paymentService';
import { 
  CreditCard, 
  History, 
  Calendar, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  X, 
  Loader2, 
  ChevronRight,
  Info
} from 'lucide-react';

/**
 * Urugo Rental - Tenant Dashboard (Home)
 * Modernized with Tailwind CSS & Brand Color #54ab91
 */

function Home() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: '',
    phoneNumber: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const brandColor = '#54ab91';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await getTenantPayments();
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentPayment = payments.find(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'completed');

  const handlePayClick = (payment) => {
    setSelectedPayment(payment);
    setFormData({ paymentMethod: '', phoneNumber: '' });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await processPayment({
        paymentId: selectedPayment._id,
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.phoneNumber
      });

      if (response.success) {
        alert(response.message);
        setShowModal(false);
        fetchPayments();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-[#54ab91]" size={40} />
    </div>
  );

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-5xl mx-auto space-y-8 font-sans">
      
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to Urugo</h2>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Tenant Dashboard</p>
      </div>

      {/* Hero Section: Current Rent Due */}
      {currentPayment ? (
        <div 
          className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border-2 transition-all ${
            currentPayment.status === 'overdue' 
            ? 'bg-red-50/50 border-red-200' 
            : 'bg-[#54ab91]/5 border-[#54ab91]/20'
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {currentPayment.status === 'overdue' 
                  ? <AlertCircle className="text-red-500" size={20} />
                  : <CreditCard className="text-[#54ab91]" size={20} />
                }
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${
                  currentPayment.status === 'overdue' ? 'text-red-600' : 'text-[#54ab91]'
                }`}>
                  {currentPayment.status === 'overdue' ? 'Payment Overdue' : 'Upcoming Rent'}
                </span>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-black tracking-tighter ${
                currentPayment.status === 'overdue' ? 'text-red-600' : 'text-slate-900'
              }`}>
                {(currentPayment.amount + currentPayment.penaltyAmount).toLocaleString()} <span className="text-2xl">RWF</span>
              </h1>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-600 font-bold">
                  <Calendar size={16} /> 
                  <span>Due Date: {formatDate(currentPayment.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Building2 size={16} />
                  <span>{currentPayment.propertyId?.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePayClick(currentPayment)}
              style={{ backgroundColor: currentPayment.status === 'overdue' ? '#dc2626' : brandColor }}
              className="w-full md:w-auto px-10 py-5 text-white rounded-2xl font-black text-lg shadow-xl shadow-[#54ab91]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Smartphone size={24} />
              Pay with Mobile Money
            </button>
          </div>
          
          {/* Background Decorative Icon */}
          <CreditCard className="absolute -bottom-10 -right-10 text-slate-900/5 rotate-12" size={240} />
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-12 text-center">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-200">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">All Caught Up!</h3>
          <p className="text-slate-600 font-medium mt-2">You have no pending payments at this time.</p>
        </div>
      )}

      {/* Payment History Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="text-[#54ab91]" size={24} /> Payment History
          </h3>
        </div>

        {paidPayments.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-medium">
            No history found. Your future payments will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {paidPayments.map((payment) => (
              <div key={payment._id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-[#54ab91]/30 transition-all">
                <div className="space-y-1">
                  <p className="font-black text-slate-900 text-lg">Rent Payment • {payment.paymentMonth}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
                    <Calendar size={14} />
                    <span>Paid on {formatDate(payment.paidDate)}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <p className="text-xl font-black text-emerald-500">{payment.amount.toLocaleString()} RWF</p>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                    <CheckCircle2 size={10} /> Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Payment</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Payment Summary Box */}
              <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Base Rent</span>
                  <span className="text-slate-900 font-black">{selectedPayment.amount.toLocaleString()} RWF</span>
                </div>
                {selectedPayment.penaltyAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500 font-bold uppercase tracking-wider">Late Penalty</span>
                    <span className="text-red-600 font-black">+{selectedPayment.penaltyAmount.toLocaleString()} RWF</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 pt-2" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-[#54ab91]">
                    {(selectedPayment.amount + selectedPayment.penaltyAmount).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['mtn_mobile_money', 'airtel_money'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method })}
                        className={`p-4 rounded-2xl border-2 text-sm font-black transition-all flex flex-col items-center gap-2 ${
                          formData.paymentMethod === method 
                          ? 'border-[#54ab91] bg-[#54ab91]/5 text-[#54ab91]' 
                          : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <Smartphone size={24} />
                        {method === 'mtn_mobile_money' ? 'MTN MoMo' : 'Airtel Money'}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.paymentMethod && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input 
                      type="text" 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleChange} 
                      placeholder="+250 7..." 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#54ab91] font-bold text-slate-900 transition-all" 
                    />
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3">
                  <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                    Follow the USSD prompt on your phone after clicking pay to enter your PIN.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={processing || !formData.paymentMethod}
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-5 text-white font-black rounded-2xl active:scale-95 transition-all shadow-xl shadow-[#54ab91]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin" size={20} /> : 'Complete Secure Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;