import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, ArrowUpRight, History } from 'lucide-react';

const Wallet = () => {
  const { user } = useAuth();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        const res = await axios.get('/api/leases/my-lease', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLease(res.data.lease);
      } catch (error) {
        console.error("Could not fetch lease details for payment", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaseData();
  }, []);

  const handlePayment = () => {
    if (!lease) return alert("No active lease found to pay for.");

    const handler = window.PaystackPop.setup({
      key: "pk_test_c2980776b695a9557af55764f9ff1e4b1dd75489", // Replace with your actual Paystack public key
      email: user?.email,
      amount: lease.rentAmount * 100, // Paystack expects amount in kobo/cents (multiply by 100)
      currency: "RWF",
      ref: `txn_${Date.now()}`,
      channels: ['mobile_money', 'card'], // Enable Mobile Money and card payments
      metadata: {
        custom_fields: [
          {
            display_name: "Unit Number",
            variable_name: "unit_number",
            value: lease.unitNumber
          },
          {
            display_name: "Lease ID",
            variable_name: "lease_id",
            value: lease._id
          }
        ]
      },
      callback: async (response) => {
        console.log("Payment successful", response);
        try {
          // Verify and record payment on backend
          const res = await axios.post(
            '/api/payments/verify-paystack',
            { reference: response.reference },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          
          if (res.data.success) {
            alert(`Payment Successful! Your rent has been recorded.`);
            // Refresh lease data to show updated status
            window.location.reload();
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment received but verification failed. Please contact support with reference: ' + response.reference);
        }
      },
      onClose: () => {
        console.log("Payment window closed");
      },
    });
    handler.openIframe();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <WalletIcon className="text-[#54ab91]" /> My Wallet
      </h1>

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
              className="mt-8 bg-white text-[#54ab91] px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              Pay Rent Now <ArrowUpRight size={18} />
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
    </div>
  );
};

export default Wallet;