import { useState, useEffect } from 'react';
import { getPayments, getPaymentStats } from '../../services/paymentService';

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
      setPayments(paymentsData.payments);
      setStats(statsData.stats);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#ECFDF5', color: 'var(--success-green)' };
      case 'pending': return { bg: '#FEF3C7', color: 'var(--warning-yellow-dark)' };
      case 'overdue': return { bg: '#FEF2F2', color: 'var(--error-red)' };
      default: return { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--primary-purple)' }}>
          Transactions
        </h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
              Total Revenue
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)' }}>
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
              This Month
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-green)' }}>
              ${stats.monthlyRevenue.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
              Pending
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-yellow-dark)' }}>
              {stats.pendingPayments}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-xs)' }}>
              Overdue
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--error-red)' }}>
              {stats.overduePayments}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-lg)',
        borderBottom: '1px solid var(--gray-200)',
        paddingBottom: 'var(--space-sm)'
      }}>
        {['all', 'completed', 'pending', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              background: filter === status ? 'var(--primary-purple)' : 'transparent',
              color: filter === status ? 'white' : 'var(--gray-600)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'capitalize',
              transition: 'var(--transition-fast)'
            }}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3xl)',
          textAlign: 'center',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>💰</p>
          <p style={{ color: 'var(--gray-500)' }}>No transactions yet</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--gray-200)',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr 100px',
            gap: 'var(--space-md)',
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--gray-50)',
            borderBottom: '1px solid var(--gray-200)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--gray-600)',
            textTransform: 'uppercase'
          }}>
            <div>Tenant</div>
            <div>Property</div>
            <div>Amount</div>
            <div>Due Date</div>
            <div>Paid Date</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {/* Table Body */}
          {filteredPayments.map((payment) => {
            const statusStyle = getStatusColor(payment.status);
            return (
              <div key={payment._id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr 100px',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) var(--space-lg)',
                borderBottom: '1px solid var(--gray-100)',
                alignItems: 'center'
              }}>
                {/* Tenant */}
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--gray-900)', fontSize: 'var(--font-size-sm)' }}>
                    {payment.tenantId?.userId?.firstName} {payment.tenantId?.userId?.lastName}
                  </p>
                  <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)' }}>
                    {payment.paymentFor}
                  </p>
                </div>

                {/* Property */}
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                    {payment.propertyId?.name}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-purple)' }}>
                    ${payment.amount}
                  </p>
                  {payment.penaltyAmount > 0 && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--error-red)' }}>
                      +${payment.penaltyAmount} penalty
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                    {formatDate(payment.dueDate)}
                  </p>
                </div>

                {/* Paid Date */}
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                    {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    textTransform: 'capitalize',
                    background: statusStyle.bg,
                    color: statusStyle.color
                  }}>
                    {payment.status}
                  </span>
                </div>

                {/* Action */}
                <div>
                  <button
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-300)',
                      background: 'white',
                      color: 'var(--gray-600)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Transactions;