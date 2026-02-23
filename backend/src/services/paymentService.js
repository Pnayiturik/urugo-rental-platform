const axios = require('axios');

const initializeFlutterwavePayment = async ({ email, amount, phone, name, tx_ref }) => {
  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: tx_ref, // Your custom transaction reference
        amount: amount,
        currency: 'RWF',
        payment_options: 'mobilemoneyrwanda', // Specific to Rwanda MoMo/Airtel
        redirect_url: `${process.env.FRONTEND_URL}/tenant/transactions`,
        customer: {
          email: email,
          phonenumber: phone,
          name: name,
        },
        customizations: {
          title: 'Urugo Rent Payment',
          description: 'Payment for Monthly Rent',
          logo: 'https://your-logo-url.com/logo.png',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return response.data; // This returns the payment link for the tenant
  } catch (error) {
    throw new Error('Flutterwave initialization failed');
  }
};