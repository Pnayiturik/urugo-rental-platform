const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { uploadImagesToFirebase } = require('../utils/firebaseUpload');
const mongoose = require('mongoose');
const { Readable } = require('stream');
const RentalRequest = require('../models/RentalRequest');
const TenantIncident = require('../models/TenantIncident');

const getProperties = async (req, res) => {
  if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });
  const properties = await Property.find({ landlord: req.user._id }).sort({ createdAt: -1 });
  return res.json({ properties });
};

const getPropertyById = async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, landlord: req.user._id });
  if (!property) return res.status(404).json({ message: 'Property not found' });
  return res.json({ property });
};

const createProperty = async (req, res) => {
  const payload = {
    ...req.body,
    landlord: req.user?._id || req.user?.id,
    description: req.body.description || '',
  };

  const property = await Property.create(payload);
  return res.status(201).json(property);
};

const updateProperty = async (req, res) => {
  const updates = {
    ...(req.body.description !== undefined ? { description: req.body.description } : {}),
    ...(req.body.units !== undefined ? { units: req.body.units } : {}),
  };

  const property = await Property.findOneAndUpdate(
    { _id: req.params.id, landlord: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!property) return res.status(404).json({ message: 'Property not found' });
  return res.json({ property });
};

const deleteProperty = async (req, res) => {
  const deleted = await Property.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
  if (!deleted) return res.status(404).json({ message: 'Property not found' });
  return res.json({ message: 'Property deleted' });
};

const getPublicProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 'units.status': 'vacant' })
      .sort({ createdAt: -1 })
      .lean();

    const filtered = properties
      .map((p) => ({
        ...p,
        units: (p.units || []).filter((u) => u.status === 'vacant')
      }))
      .filter((p) => p.units.length > 0);

    return res.json({ success: true, properties: filtered });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPublicPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).select(
      'name description address propertyType units images cautionFee furnishingStatus squareFootage yearBuilt utilitiesIncluded paymentTerms rules locationDetails minStay'
    );

    if (!property) return res.status(404).json({ message: 'Property not found' });
    return res.json({ property });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'propertyImages' });
    const urls = [];

    for (const file of req.files) {
      const filename = `${Date.now()}-${file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype, // important
        metadata: { originalName: file.originalname, contentType: file.mimetype }
      });

      await new Promise((resolve, reject) => {
        Readable.from(file.buffer).pipe(uploadStream).on('finish', resolve).on('error', reject);
      });

      urls.push(`/api/properties/image/${uploadStream.id.toString()}`);
    }

    return res.status(200).json({ success: true, urls });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const fileId = new mongoose.Types.ObjectId(id);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'propertyImages' });
    const files = await mongoose.connection.db.collection('propertyImages.files').find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ message: 'Image not found' });

    const mime = files[0].contentType || files[0]?.metadata?.contentType || 'image/jpeg';
    res.setHeader('Content-Type', mime);
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const requestRental = async (req, res) => {
  try {
    if (req.user?.role !== 'tenant') {
      return res.status(403).json({ message: 'Only tenants can request rentals' });
    }

    const tenantId = req.user?._id || req.user?.id;
    const property = await Property.findById(req.params.id).populate('landlord', 'email fullName name');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // prevent duplicate pending requests
    const existing = await RentalRequest.findOne({
      property: property._id,
      tenant: tenantId,
      status: 'pending'
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have a pending request for this property' });
    }

    // risk snapshot from unresolved incidents
    const incidents = await TenantIncident.find({ tenant: tenantId, resolved: false });
    const totalDebt = incidents
      .filter((i) => i.type === 'debt')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const seriousMisconduct = incidents.some(
      (i) => i.severity === 'serious' || i.type === 'legal'
    );

    const riskSnapshot = {
      hasDebt: totalDebt > 0,
      totalDebt,
      seriousMisconduct,
      openIncidents: incidents.length
    };

    const created = await RentalRequest.create({
      property: property._id,
      landlord: property.landlord?._id || property.landlord,
      tenant: tenantId,
      message: req.body?.message || '',
      riskSnapshot
    });

    // keep your existing email logic; include risk summary in email text/body

    return res.status(201).json({
      message: 'Request sent to landlord',
      requestId: created._id,
      riskSnapshot
    });
  } catch (err) {
    console.error('requestRental error:', err);
    return res.status(500).json({ message: err.message });
  }
};

const toNumOrUndef = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

module.exports = {
  getProperties,
  getPropertyById,
  getPublicProperties,
  getPublicPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  getPropertyImage,
  requestRental
};