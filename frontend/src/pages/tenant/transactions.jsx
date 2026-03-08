import React, { useState, useEffect } from 'react';
import { getTenantPayments } from '../../services/paymentService';
import { 
  Receipt, 
  Wallet, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Download,
  Loader2,
  ChevronRight,
  CreditCard,
  Home,
  XCircle
} from 'lucide-react';

/**
 * Urugo Rental - Tenant Transaction History
 * Features: Payment tracking, Receipt downloads, Status monitoring
 */

function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPayments = async () => {
    try {
      console.log('📋 Fetching tenant payment history...');
      const data = await getTenantPayments();
      setPayments(data.payments || []);
      console.log('✅ Payment history loaded:', data.payments?.length || 0, 'records');
    } catch (err) {
      console.error('❌ Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  // Calculate payment summary stats
  const stats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    completedCount: payments.filter(p => p.status === 'completed').length,
    pendingCount: payments.filter(p => p.status === 'pending').length,
    failedCount: payments.filter(p => p.status === 'failed').length
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-600', 
          icon: <CheckCircle2 size={14} />,
          label: 'Paid'
        };
      case 'pending': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-600', 
          icon: <Clock size={14} />,
          label: 'Pending'
        };
      case 'failed': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-600', 
          icon: <XCircle size={14} />,
          label: 'Failed'
        };
      case 'overdue': 
        return { 
          bg: 'bg-rose-50', 
          text: 'text-rose-600', 
          icon: <AlertCircle size={14} />,
          label: 'Overdue'
        };
      default: 
        return { 
          bg: 'bg-slate-50', 
          text: 'text-slate-600', 
          icon: <Filter size={14} />,
          label: status
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#54ab91]" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-8 px-4 sm:px-8 pb-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment History</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Track all your rent payments</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Download size={18} /> Export Receipts
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Paid', 
            value: `${stats.totalPaid.toLocaleString()} RWF`, 
            icon: <Wallet className="text-[#54ab91]" size={24} />, 
            sub: 'All Time',
            count: null
          },
          { 
            label: 'Successful', 
            value: stats.completedCount, 
            icon: <CheckCircle2 className="text-emerald-500" size={24} />, 
            sub: 'Completed',
            count: 'payments'
          },
          { 
            label: 'Pending', 
            value: stats.pendingCount, 
            icon: <Clock className="text-amber-500" size={24} />, 
            sub: 'Processing',
            count: 'payments'
          },
          { 
            label: 'Failed', 
            value: stats.failedCount, 
            icon: <XCircle className="text-red-500" size={24} />, 
            sub: 'Unsuccessful',
            count: 'attempts'
          }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-xl">{item.icon}</div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.sub}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">{item.value}</h3>
              {item.count && <span className="text-xs font-bold text-slate-400">{item.count}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl">
        {[
          { value: 'all', label: 'All' },
          { value: 'completed', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              filter === tab.value 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-4xl p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Receipt size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No transactions yet</h3>
          <p className="text-slate-500 text-sm">Your payment history will appear here once you make your first rent payment.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-4xl overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-3">Property</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Payment Method</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-50">
            {filteredPayments.map((payment) => {
              const config = getStatusConfig(payment.status);
              return (
                <div key={payment._id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-all">
                  
                  {/* Property Info */}
                  <div className="col-span-1 lg:col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#54ab91]/10 flex items-center justify-center text-[#54ab91] shrink-0">
                      <Home size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {payment.propertyId?.name || 'Property'}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate">
                        {payment.paymentFor || 'Rent Payment'}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-lg font-black text-slate-900">{payment.amount.toLocaleString()} RWF</p>
                    {payment.penaltyAmount > 0 && (
                      <p className="text-[10px] font-bold text-red-500 tracking-tighter">+{payment.penaltyAmount} Penalty</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 capitalize">
                        {payment.paymentMethod || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Date Information */}
                  <div className="col-span-1 lg:col-span-3 space-y-1">
                    {payment.paidDate ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                          Paid: {formatDate(payment.paidDate)}
                        </span>
                      </div>
                    ) : payment.dueDate ? (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                          Due: {formatDate(payment.dueDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                        {formatDate(payment.createdAt)}
                      </span>
                    )}
                    {payment.transactionId && (
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        ID: {payment.transactionId.substring(0, 20)}...
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-1 lg:col-span-2 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                      {config.icon}
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Footer */}
      {payments.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Need a receipt?</h4>
            <p className="text-sm text-slate-600">
              All completed payments automatically generate receipts. Click on any transaction to download or view your receipt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;