const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyPath = envPath
    ? path.resolve(envPath)
    : path.resolve(__dirname, '../../servicekey.json');

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Firebase key file not found at: ${keyPath}`);
  }

  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'urugo-app.appspot.com'
  });
}

module.exports = admin;