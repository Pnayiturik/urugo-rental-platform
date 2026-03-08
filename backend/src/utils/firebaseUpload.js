const admin = require('../config/firebase');

const uploadImagesToFirebase = async (files = [], folder = 'properties') => {
  if (!files.length) return [];

  const bucket = admin.storage().bucket();
  const uploaded = [];

  for (const file of files) {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(fileName);

    await blob.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      resumable: false
    });

    await blob.makePublic();
    uploaded.push(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
  }

  return uploaded;
};

module.exports = { uploadImagesToFirebase };