const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Lease = require('../models/Lease');
const User = require('../models/User');
const Property = require('../models/Property');
const Document = require('../models/Document');
const { sendTenantInvitation } = require('../services/emailService');

const isNationalId = (value) => /^\d{16}$/.test(String(value || '').trim());

const createLease = async (req, res) => {
  try {
    const landlordId = req.user?._id || req.userId;
    if (!landlordId) return res.status(401).json({ message: 'Unauthorized' });

    const propertyId = req.body.propertyId;
    const unitId = req.body.unitId || req.body.requestedUnit;
    const tenantEmail = String(req.body.tenantEmail || req.body.email || '').toLowerCase().trim();
    const tenantFirstName = (req.body.tenantFirstName || req.body.firstName || '').trim();
    const tenantLastName = (req.body.tenantLastName || req.body.lastName || 'Tenant').trim();
    const tenantPhone = (req.body.tenantPhone || req.body.phone || '').trim();
    const tenantNationalId = (req.body.nationalId || req.body.tenantNationalId || '').trim();
    const tenantPassport = (req.body.passportNumber || req.body.tenantPassportNumber || '').trim();

    if (!propertyId || !unitId || !tenantEmail || !tenantFirstName) {
      return res.status(400).json({
        message: 'Missing required fields: propertyId, unitId/requestedUnit, tenantEmail, tenantFirstName'
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const propertyOwnerId =
      property.landlord || property.createdBy || property.owner || property.user;

    if (!propertyOwnerId || String(propertyOwnerId) !== String(landlordId)) {
      return res.status(403).json({ message: 'You are not allowed to assign this property' });
    }

    const unit = property.units.id(unitId) || property.units.find((u) => String(u._id) === String(unitId));
    if (!unit) return res.status(400).json({ message: 'Selected unit not found in property' });

    if (unit.status !== 'vacant') {
      return res.status(400).json({ message: 'Selected unit is not vacant' });
    }


    let tenant = await User.findOne({ email: tenantEmail });
    let generatedTempPassword = null;
    let newUserCreated = false;

    if (!tenant) {
      generatedTempPassword = crypto.randomBytes(6).toString('base64url');
      const hashedPassword = await bcrypt.hash(generatedTempPassword, 10);

      tenant = await User.create({
        firstName: tenantFirstName,
        lastName: tenantLastName,
        email: tenantEmail,
        password: hashedPassword,
        phone: tenantPhone,
        role: 'tenant',
        canLogin: true,
        mustChangePassword: true,
        invitedByLandlord: landlordId
      });
      newUserCreated = true;
    }

    const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const endDate = req.body.endDate
      ? new Date(req.body.endDate)
      : new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1));

    const Tenant = require('../models/Tenant');
    let tenantRecord = await Tenant.findOne({ userId: tenant._id, propertyId: property._id, unitId: unit._id });
    if (!tenantRecord) {
      tenantRecord = await Tenant.create({
        userId: tenant._id,
        landlordId: landlordId,
        propertyId: property._id,
        unitId: unit._id,
        leaseStart: startDate,
        leaseEnd: endDate,
        rentAmount: Number(req.body.rentAmount || unit.rent || 0),
        status: 'active'
      });
    }

    const paymentTerms = req.body.paymentTerms || property.paymentTerms || 'full';

    const lease = await Lease.create({
      landlordId,
      tenantId: tenant._id,
      propertyId: property._id,
      unitNumber: unit.unitNumber,
      startDate,
      endDate,
      rentAmount: Number(req.body.rentAmount || unit.rent || 0),
      paymentPlan: paymentTerms,
      paymentTerms,
      cautionFee: Number(req.body.cautionFee ?? property.cautionFee ?? 0),
      paymentType: req.body.paymentType || 'Full',
      status: req.body.status || 'active',
      terms: req.body.terms || 'Standard Urugo Rental Agreement',
      tenantIdentity: isNationalId(tenantNationalId)
        ? { nationalId: tenantNationalId }
        : { passportNumber: tenantPassport || tenantNationalId || `TENANT-${tenant._id}` },
      landlordIdentity: isNationalId(req.body.landlordNationalId)
        ? { nationalId: String(req.body.landlordNationalId).trim() }
        : { passportNumber: String(req.body.landlordPassportNumber || `LANDLORD-${landlordId}`).trim() }
    });

    unit.status = 'occupied';
    await property.save();

    // Create lease document for both the landlord AND the tenant so each can see it
    await Document.create([
      {
        title: `Lease Agreement: ${tenant.firstName} ${tenant.lastName}`,
        type: 'Lease',
        ownerId: landlordId,
        uploadedBy: landlordId,
        relatedId: lease._id,
        relatedTo: lease._id,
        relatedModel: 'Lease'
      },
      {
        title: `Lease Agreement – ${property.name} (Unit ${unit.unitNumber})`,
        type: 'Lease',
        ownerId: tenant._id,
        uploadedBy: landlordId,
        relatedId: lease._id,
        relatedTo: lease._id,
        relatedModel: 'Lease'
      }
    ]);

    // Always send an email to the tenant, with or without a temp password
    try {
      let emailResult;
      if (generatedTempPassword) {
        // New tenant: send invitation with temp password
        emailResult = await sendTenantInvitation({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          landlordName: `${req.user?.firstName || 'Landlord'} ${req.user?.lastName || ''}`.trim(),
          propertyName: property.name,
          unitNumber: unit.unitNumber,
          rent: lease.rentAmount,
          tempPassword: generatedTempPassword,
          loginUrl: process.env.FRONTEND_URL || 'http://localhost:5173/login'
        });
      } else {
        // Existing tenant: send notification without temp password
        const subject = `You have been assigned a new lease at ${property.name}`;
        const html = `
          <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px;">
            <h2 style="font-size: 24px; font-weight: 900; color: #0f172a;">Lease Assignment Notification</h2>
            <p style="font-size: 16px; color: #64748b;">
              Hello ${tenant.firstName} ${tenant.lastName},<br/>
              You have been assigned to <b>Unit ${unit.unitNumber}</b> at <b>${property.name}</b> by your landlord ${req.user?.firstName || 'Landlord'} ${req.user?.lastName || ''}.
            </p>
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
              <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #94a3b8;">Lease Details</p>
              <p style="margin: 12px 0 4px 0;"><strong>Property:</strong> ${property.name}</p>
              <p style="margin: 0 0 4px 0;"><strong>Unit:</strong> ${unit.unitNumber}</p>
              <p style="margin: 0 0 4px 0;"><strong>Rent:</strong> ${lease.rentAmount} RWF</p>
              <p style="margin: 0;"><strong>Start Date:</strong> ${lease.startDate.toLocaleDateString()}</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173/login'}" style="display: inline-block; background-color: #54ab91; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">
              Access Your Dashboard
            </a>
            <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
              If you have any questions, please contact your landlord.
            </p>
          </div>
        `;
        const { sendEmail } = require('../services/emailService');
        emailResult = await sendEmail({
          to: tenant.email,
          subject,
          html
        });
      }
      if (emailResult && emailResult.accepted && emailResult.accepted.length > 0) {
        console.log('Tenant lease notification sent to:', tenant.email);
      } else {
        console.warn('Tenant lease notification not accepted by mail server:', emailResult);
      }
    } catch (emailError) {
      console.error('Tenant lease notification email failed:', emailError);
    }

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email phone')
      .populate('landlordId', 'firstName lastName email phone');

    return res.status(201).json({
      success: true,
      lease: populatedLease,
      ...(generatedTempPassword ? { tenantCredentials: { email: tenant.email, tempPassword: generatedTempPassword } } : {})
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyLeases = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const query = req.user?.role === 'tenant' ? { tenantId: userId } : { landlordId: userId };

    const leases = await Lease.find(query)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email phone')
      .populate('landlordId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leases });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyLease = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const lease = await Lease.findOne({ tenantId: userId, status: { $in: ['active', 'Active'] } })
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email phone')
      .populate('landlordId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, lease });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLeaseById = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email phone')
      .populate('landlordId', 'firstName lastName email phone');

    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    const userId = String(req.user?._id || req.userId);
    const canAccess =
      String(lease.landlordId?._id || lease.landlordId) === userId ||
      String(lease.tenantId?._id || lease.tenantId) === userId;

    if (!canAccess) return res.status(403).json({ message: 'Access denied' });

    return res.status(200).json({ success: true, lease });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateLeaseStatus = async (req, res) => {
  try {
    const allowedStatuses = ['active', 'expired', 'terminated', 'Draft', 'Active'];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid lease status' });
    }

    const lease = await Lease.findOne({ _id: req.params.id, landlordId: req.user?._id || req.userId });
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    lease.status = status;
    await lease.save();

    return res.status(200).json({ success: true, lease });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLease,
  getMyLeases,
  getMyLease,
  getLeaseById,
  updateLeaseStatus,
  assignRentalRequest: createLease
};