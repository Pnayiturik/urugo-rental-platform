import { useState, useEffect } from 'react';
import { getTenantPayments, processPayment } from '../../services/paymentService';

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await getTenantPayments();
      setPayments(data.payments);
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-500)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--primary-purple)', marginBottom: 'var(--space-xs)' }}>
          Welcome to Your Dashboard
        </h2>
        <p style={{ color: 'var(--gray-600)' }}>Manage your rent payments and view your payment history</p>
      </div>

      {/* Current Rent Due Card */}
      {currentPayment ? (
        <div style={{
          background: currentPayment.status === 'overdue' ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          border: `2px solid ${currentPayment.status === 'overdue' ? 'var(--error-red)' : 'var(--primary-purple)'}`,
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                {currentPayment.status === 'overdue' ? '⚠️ OVERDUE PAYMENT' : '💰 Current Rent Due'}
              </p>
              <h1 style={{ 
                fontSize: 'var(--font-size-4xl)', 
                fontWeight: 'var(--font-weight-bold)', 
                color: currentPayment.status === 'overdue' ? 'var(--error-red)' : 'var(--primary-purple)',
                marginBottom: 'var(--space-sm)'
              }}>
                ${(currentPayment.amount + currentPayment.penaltyAmount).toLocaleString()}
              </h1>
              {currentPayment.penaltyAmount > 0 && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-red)', marginBottom: 'var(--space-xs)' }}>
                  Includes ${currentPayment.penaltyAmount} late payment penalty
                </p>
              )}
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                Due Date: <strong>{formatDate(currentPayment.dueDate)}</strong>
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                Property: <strong>{currentPayment.propertyId?.name}</strong>
              </p>
            </div>
            <span style={{
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-full)',
              background: currentPayment.status === 'overdue' ? 'var(--error-red)' : 'var(--warning-yellow-dark)',
              color: 'white',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              textTransform: 'uppercase'
            }}>
              {currentPayment.status}
            </span>
          </div>

          <button
            onClick={() => handlePayClick(currentPayment)}
            style={{
              background: currentPayment.status === 'overdue' ? 'var(--error-red)' : 'var(--primary-purple)',
              color: 'white',
              padding: 'var(--space-md) var(--space-2xl)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-bold)',
              width: '100%',
              boxShadow: 'var(--shadow-md)',
              transition: 'var(--transition-fast)'
            }}
          >
            💳 Pay Now
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          border: '2px solid var(--success-green)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-md)' }}>✅</p>
          <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--success-green)', marginBottom: 'var(--space-xs)' }}>
            All Caught Up!
          </h3>
          <p style={{ color: 'var(--gray-600)' }}>You have no pending payments</p>
        </div>
      )}

      {/* Payment History */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gray-200)'
      }}>
        <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-lg)', color: 'var(--gray-900)' }}>
          Payment History
        </h3>

        {paidPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>📭</p>
            <p>No payment history yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {paidPayments.map((payment) => (
              <div key={payment._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)'
              }}>
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--gray-900)', fontSize: 'var(--font-size-sm)' }}>
                    Rent Payment - {payment.paymentMonth}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
                    Paid on {formatDate(payment.paidDate)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-green)' }}>
                    ${payment.amount}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    background: '#ECFDF5',
                    color: 'var(--success-green)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginTop: 'var(--space-xs)'
                  }}>
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 'var(--space-lg)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '500px',
            padding: 'var(--space-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-900)' }}>Pay Rent</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 'var(--font-size-xl)', color: 'var(--gray-500)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Payment Summary */}
            <div style={{
              background: 'var(--gray-50)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                Property: <strong>{selectedPayment.propertyId?.name}</strong>
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-xs)' }}>
                Rent Amount: <strong>${selectedPayment.amount}</strong>
              </p>
              {selectedPayment.penaltyAmount > 0 && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-red)', marginBottom: 'var(--space-xs)' }}>
                  Late Penalty: <strong>${selectedPayment.penaltyAmount}</strong>
                </p>
              )}
              <div style={{ borderTop: '1px solid var(--gray-300)', marginTop: 'var(--space-sm)', paddingTop: 'var(--space-sm)' }}>
                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)' }}>
                  Total: ${(selectedPayment.amount + selectedPayment.penaltyAmount).toLocaleString()}
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid var(--error-red)',
                color: 'var(--error-red)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Payment Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                  Payment Method
                </label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required
                  style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)', background: 'white' }}
                >
                  <option value="">Select method</option>
                  <option value="mtn_mobile_money">📱 MTN Mobile Money</option>
                  <option value="airtel_money">📱 Airtel Money</option>
                </select>
              </div>

              {/* Phone Number */}
              {formData.paymentMethod && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                    Phone Number
                  </label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+250 700 000 000" required
                    style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: 'var(--font-size-base)' }}
                  />
                </div>
              )}

              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', background: '#FEF3C7', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                ℹ️ You will receive a prompt on your phone to confirm the payment
              </p>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', background: 'white', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={processing}
                  style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary-purple)', color: 'white', cursor: processing ? 'not-allowed' : 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', opacity: processing ? 0.6 : 1 }}
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;