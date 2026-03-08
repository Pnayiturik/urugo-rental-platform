import React, { useState, useEffect } from 'react';
import { getPayments, getPaymentStats } from '../../services/paymentService';
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
  TrendingUp,
  RefreshCw,
  XCircle
} from 'lucide-react';

/**
 * Urugo Rental - Modern Transactions Management
 * Features: Responsive Flat UI, Advanced Filtering, Brand Color #54ab91, Weekly Penalties
 */

function Transactions() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      
      console.log('📋 Fetching landlord payments and stats...');
      const [paymentsData, statsData] = await Promise.all([
        getPayments(),
        getPaymentStats()
      ]);
      
      setPayments(paymentsData.payments || []);
      setStats(statsData.stats || null);
      
      console.log('✅ Landlord data loaded:', paymentsData.payments?.length || 0, 'payments');
      console.log('💰 Stats:', statsData.stats);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate weekly penalty (5% per week overdue)
  const calculatePenalty = (payment) => {
    if (payment.status !== 'overdue' || !payment.dueDate) return 0;
    
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const diffTime = Math.abs(today - dueDate);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    // 5% penalty per week
    const penaltyRate = 0.05;
    const penalty = payment.amount * penaltyRate * diffWeeks;
    
    return { penalty: Math.round(penalty), weeks: diffWeeks };
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-600', 
          icon: <CheckCircle2 size={14} />,
          label: 'Completed'
        };
      case 'pending': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-600', 
          icon: <Clock size={14} />,
          label: 'Pending'
        };
      case 'overdue': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-600', 
          icon: <AlertCircle size={14} />,
          label: 'Overdue'
        };
      case 'failed': 
        return { 
          bg: 'bg-rose-50', 
          text: 'text-rose-600', 
          icon: <XCircle size={14} />,
          label: 'Failed'
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">
            Real-time revenue tracking {refreshing && <span className="text-[#54ab91]">• Updating...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchData()}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-[#54ab91] text-white rounded-2xl text-sm font-bold hover:bg-[#459580] active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { 
              label: 'Total Revenue', 
              value: `${stats.totalRevenue?.toLocaleString() || 0} RWF`, 
              icon: <Wallet className="text-[#54ab91]" size={24} />, 
              sub: 'Completed' 
            },
            { 
              label: 'Completed', 
              value: stats.completedPayments || 0, 
              icon: <CheckCircle2 className="text-emerald-500" size={24} />, 
              sub: 'Payments' 
            },
            { 
              label: 'Pending', 
              value: stats.pendingPayments || 0, 
              icon: <Clock className="text-amber-500" size={24} />, 
              sub: 'Awaiting' 
            },
            { 
              label: 'Overdue', 
              value: stats.overduePayments || 0, 
              icon: <AlertCircle className="text-red-500" size={24} />, 
              sub: 'Late' 
            },
            { 
              label: 'Failed', 
              value: payments.filter(p => p.status === 'failed').length, 
              icon: <XCircle className="text-rose-500" size={24} />, 
              sub: 'Unsuccessful' 
            }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-xl">{item.icon}</div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.sub}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-2xl font-black text-slate-900 truncate">{item.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl overflow-x-auto">
        {['all', 'completed', 'pending', 'overdue', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === status 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-4xl p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Receipt size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No transactions found</h3>
          <p className="text-slate-500 text-sm">There are no records matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-4xl overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-3">Tenant & Property</div>
            <div className="col-span-2">Amount & Penalty</div>
            <div className="col-span-3">Timeline</div>
            <div className="col-span-2">Payment Method</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-50">
            {filteredPayments.map((payment) => {
              const config = getStatusConfig(payment.status);
              const penaltyInfo = calculatePenalty(payment);
              const totalAmount = payment.amount + (penaltyInfo.penalty || 0);
              
              return (
                <div key={payment._id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-all">
                  
                  {/* Tenant & Property */}
                  <div className="col-span-1 lg:col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Receipt size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {payment.tenantId?.firstName || payment.tenantId?.userId?.firstName || 'Tenant'} {payment.tenantId?.lastName || payment.tenantId?.userId?.lastName || ''}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate">
                        {payment.propertyId?.name || 'Property'} • {payment.paymentFor || 'Rent'}
                      </p>
                    </div>
                  </div>

                  {/* Amount & Penalty */}
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-lg font-black text-slate-900">{payment.amount.toLocaleString()} RWF</p>
                    {penaltyInfo.penalty > 0 && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[11px] font-bold text-red-600 tracking-tighter">
                          +{penaltyInfo.penalty.toLocaleString()} RWF Penalty
                        </p>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                          {penaltyInfo.weeks} week{penaltyInfo.weeks > 1 ? 's' : ''} @ 5%/week
                        </p>
                        <p className="text-xs font-black text-slate-900 border-t border-slate-200 pt-1">
                          Total: {totalAmount.toLocaleString()} RWF
                        </p>
                      </div>
                    )}
                    {payment.penaltyAmount > 0 && penaltyInfo.penalty === 0 && (
                      <p className="text-[10px] font-bold text-red-500 tracking-tighter mt-1">
                        +{payment.penaltyAmount} Penalty
                      </p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="col-span-1 lg:col-span-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[11px] font-bold uppercase tracking-tighter">
                        Due: {formatDate(payment.dueDate)}
                      </span>
                    </div>
                    {payment.paidDate && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                          Paid: {formatDate(payment.paidDate)}
                        </span>
                      </div>
                    )}
                    {payment.status === 'overdue' && !payment.paidDate && (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                          {Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="col-span-1 lg:col-span-2">
                    <span className="text-sm font-bold text-slate-700 capitalize">
                      {payment.paymentMethod || 'Pending'}
                    </span>
                    {payment.transactionId && (
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {payment.transactionId.substring(0, 16)}...
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 lg:col-span-2">
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

      {/* Penalty Info Banner */}
      {filteredPayments.some(p => p.status === 'overdue') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Overdue Payment Penalties</h4>
            <p className="text-sm text-slate-600">
              Overdue payments automatically accrue a <strong>5% weekly penalty</strong> on the original rent amount. 
              The penalty continues to increase each week until payment is received.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;