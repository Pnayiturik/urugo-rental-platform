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
  TrendingUp
} from 'lucide-react';

/**
 * Urugo Rental - Modern Transactions Management
 * Features: Responsive Flat UI, Advanced Filtering, Brand Color #54ab91
 */

function Transactions() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsData, statsData] = await Promise.all([
        getPayments(),
        getPaymentStats()
      ]);
      setPayments(paymentsData.payments || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle2 size={12} /> };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={12} /> };
      case 'overdue': return { bg: 'bg-red-50', text: 'text-red-600', icon: <AlertCircle size={12} /> };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: <Filter size={12} /> };
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
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">Real-time revenue tracking</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold active:scale-95 transition-all">
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} RWF`, icon: <Wallet className="text-[#54ab91]" />, sub: 'All Time' },
            { label: 'This Month', value: `${stats.monthlyRevenue.toLocaleString()} RWF`, icon: <TrendingUp className="text-emerald-500" />, sub: 'Current Period' },
            { label: 'Pending', value: stats.pendingPayments, icon: <Clock className="text-amber-500" />, sub: 'Awaiting Action' },
            { label: 'Overdue', value: stats.overduePayments, icon: <AlertCircle className="text-red-500" />, sub: 'Needs Attention' }
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
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl">
        {['all', 'completed', 'pending', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
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
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Receipt size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No transactions found</h3>
          <p className="text-slate-500 text-sm">There are no records matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-3">Tenant & Description</div>
            <div className="col-span-2">Property</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Timeline</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Details</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-50">
            {filteredPayments.map((payment) => {
              const config = getStatusConfig(payment.status);
              return (
                <div key={payment._id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-all">
                  
                  {/* Tenant & Desc */}
                  <div className="col-span-1 lg:col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Receipt size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {payment.tenantId?.userId?.firstName} {payment.tenantId?.userId?.lastName}
                      </p>
                      <p className="text-[11px] font-bold text-[#54ab91] uppercase tracking-tighter truncate">{payment.paymentFor}</p>
                    </div>
                  </div>

                  {/* Property */}
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-sm font-bold text-slate-700 truncate">{payment.propertyId?.name}</p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-sm font-black text-slate-900">{payment.amount.toLocaleString()} RWF</p>
                    {payment.penaltyAmount > 0 && (
                      <p className="text-[10px] font-bold text-red-500 tracking-tighter">+{payment.penaltyAmount} Penalty</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="col-span-1 lg:col-span-2 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[11px] font-bold uppercase tracking-tighter">Due: {formatDate(payment.dueDate)}</span>
                    </div>
                    {payment.paidDate && (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle2 size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">Paid: {formatDate(payment.paidDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 lg:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                      {config.icon}
                      {payment.status}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 lg:col-span-1 flex justify-end">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;