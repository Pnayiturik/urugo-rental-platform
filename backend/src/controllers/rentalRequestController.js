// Get all requests for the logged-in tenant
const getTenantRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const email = user.email?.toLowerCase();
    if (!email) return res.status(400).json({ message: 'User email missing' });

    const requests = await RentalRequest.find({ tenantEmail: email })
      .populate('propertyId', 'name address units')
      .sort({ createdAt: -1 });

    const normalized = requests.map((r) => {
      const unit = (r.propertyId?.units || []).find((u) => String(u._id) === String(r.requestedUnit));
      return {
        _id: r._id,
        firstName: r.firstName,
        lastName: r.lastName,
        status: r.status,
        createdAt: r.createdAt,
        propertyId: {
          _id: r.propertyId?._id,
          name: r.propertyId?.name,
          address: r.propertyId?.address
        },
        requestedUnit: String(r.requestedUnit),
        requestedUnitLabel: unit?.unitNumber || String(r.requestedUnit),
        requestedUnitRent: Number(unit?.rent || 0),
        assignedLease: r.assignedLease || null
      };
    });

    return res.json({ success: true, requests: normalized });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const RentalRequest = require('../models/RentalRequest');
const Property = require('../models/Property');
const { createLease } = require('./leaseController');
const { sendEmail } = require('../services/emailService');

// Public endpoint (NO auth middleware)
const sendRequest = async (req, res) => {
  try {
    // accept both new and legacy keys
    const rawFirstName = req.body.firstName;
    const rawLastName = req.body.lastName;
    const rawEmail = req.body.email || req.body.tenantEmail;
    const rawPhone = req.body.phone || req.body.tenantPhone;
    const rawNationalId = req.body.nationalId || req.body.idNumber || req.body.passportNumber;
    const propertyId = req.body.propertyId || req.body.property;
    let requestedUnit = req.body.requestedUnit || req.body.unitId;

    // split tenantName fallback
    const tenantName = (req.body.tenantName || '').trim();
    const parts = tenantName ? tenantName.split(/\s+/) : [];
    const firstName = (rawFirstName || parts[0] || '').trim();
    const lastName = (rawLastName || parts.slice(1).join(' ') || 'N/A').trim();

    if (!firstName || !rawEmail || !rawPhone || !rawNationalId || !propertyId) {
      return res.status(400).json({
        message: 'Missing required fields: firstName, email, phone, nationalId, propertyId'
      });
    }

    const property = await Property.findById(propertyId).select('createdBy landlord owner user units name').lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Prefer creator as source of truth
    const landlordId =
      property.createdBy || property.landlord || property.owner || property.user;

    if (!landlordId) {
      return res.status(400).json({ message: 'Property has no landlord reference (createdBy missing)' });
    }

    const vacantUnits = (property.units || []).filter((u) => u.status === 'vacant');
    if (!vacantUnits.length) return res.status(400).json({ message: 'No vacant units available for this property' });

    if (!requestedUnit) requestedUnit = vacantUnits[0]._id;

    const unit = (property.units || []).find((u) => String(u._id) === String(requestedUnit));
    if (!unit) return res.status(400).json({ message: 'Selected unit not found for this property' });
    if (unit.status !== 'vacant') return res.status(400).json({ message: 'Selected unit is not vacant' });

    const doc = await RentalRequest.create({
      firstName,
      lastName,
      tenantEmail: String(rawEmail).toLowerCase().trim(),
      phone: String(rawPhone).trim(),
      nationalId: String(rawNationalId).trim(),
      propertyId,
      requestedUnit: unit._id,
      landlord: landlordId,
      status: 'pending'
    });

    return res.status(201).json({ success: true, request: doc });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getLandlordRequests = async (req, res) => {
  try {
    const landlordId = req.user._id;

    const requests = await RentalRequest.find({ landlord: landlordId, status: 'pending' })
      .populate('propertyId', 'name address units')
      .sort({ createdAt: -1 });

    // shape aligned for RequestsInbox.jsx
    const normalized = requests.map((r) => {
      const unit = (r.propertyId?.units || []).find((u) => String(u._id) === String(r.requestedUnit));
      return {
        _id: r._id,
        firstName: r.firstName,
        lastName: r.lastName,
        tenantEmail: r.tenantEmail,
        phone: r.phone,
        nationalId: r.nationalId,
        status: r.status,
        createdAt: r.createdAt,
        propertyId: {
          _id: r.propertyId?._id,
          name: r.propertyId?.name,
          address: r.propertyId?.address
        },
        requestedUnit: String(r.requestedUnit),
        requestedUnitLabel: unit?.unitNumber || String(r.requestedUnit),
        requestedUnitRent: Number(unit?.rent || 0),
        requestedUnitDetails: unit
          ? {
              _id: String(unit._id),
              unitNumber: unit.unitNumber,
              rent: Number(unit.rent || 0),
              bedrooms: unit.bedrooms,
              bathrooms: unit.bathrooms,
              status: unit.status
            }
          : null
      };
    });

    return res.json({ success: true, requests: normalized });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const assignAndCreateAccount = async (req, res) => {
  try {
    const landlordId = req.user._id;
    const r = await RentalRequest.findOne({ _id: req.params.id, landlord: landlordId, status: 'pending' });
    if (!r) return res.status(404).json({ message: 'Request not found' });

    const mockReq = {
      ...req,
      body: {
        propertyId: r.propertyId,
        unitId: r.requestedUnit,
        tenantFirstName: r.firstName,
        tenantLastName: r.lastName,
        tenantEmail: r.tenantEmail,
        tenantPhone: r.phone,
        nationalId: r.nationalId
      }
    };

    let leaseResponse = null;
    const mockRes = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) {
        if (this._status >= 400) throw new Error(payload?.message || 'createLease failed');
        leaseResponse = payload;
        return payload;
      }
    };

    let emailDebug = null;
    let emailError = null;
    try {
      await createLease(mockReq, mockRes); // keeps your existing lease + archive logic
      // If leaseResponse contains tenantCredentials, email was attempted
      if (leaseResponse && leaseResponse.tenantCredentials) {
        emailDebug = leaseResponse.tenantCredentials;
      }
    } catch (err) {
      emailError = err.message || err;
    }

    r.status = 'assigned';
    r.assignedLease = leaseResponse?.lease?._id || leaseResponse?._id || null;
    await r.save();

    return res.json({
      success: true,
      message: 'Assigned & account created',
      lease: leaseResponse,
      ...(emailDebug ? { emailDebug } : {}),
      ...(emailError ? { emailError } : {})
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { sendRequest, getLandlordRequests, assignAndCreateAccount, getTenantRequests };