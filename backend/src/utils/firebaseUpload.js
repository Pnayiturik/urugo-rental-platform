const admin = require('../config/firebase');


const uploadImagesToFirebase = async (files = [], folder = 'properties') => {
  if (!files.length) return [];
  if (!admin || !admin.storage || typeof admin.storage !== 'function') {
    console.warn('[firebaseUpload] Firebase not configured. Skipping upload.');
    return [];
  }
  let bucket;
  try {
    bucket = admin.storage().bucket();
  } catch (err) {
    console.warn('[firebaseUpload] Could not get bucket:', err.message);
    return [];
  }
  const uploaded = [];
  for (const file of files) {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const blob = bucket.file(fileName);
      await blob.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        resumable: false
      });
      await blob.makePublic();
      uploaded.push(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
    } catch (err) {
      console.warn('[firebaseUpload] Failed to upload file:', file.originalname, err.message);
      // skip this file, continue
    }
  }
  return uploaded;
};

module.exports = { uploadImagesToFirebase };