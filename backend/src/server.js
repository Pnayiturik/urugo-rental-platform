const app = require('./app');
const connectDB = require('./config/db');
const { initializeTransporter } = require('./services/emailService');
const { startReminderScheduler } = require('./services/paymentReminderJob');
require('dotenv').config();
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initializeTransporter();
    startReminderScheduler();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const tenantIncidentRoutes = require('./routes/tenantIncidentRoutes');
app.use('/api/tenant-incidents', tenantIncidentRoutes);

startServer();