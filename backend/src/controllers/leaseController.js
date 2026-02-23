const Lease = require('../models/Lease');
const Property = require('../models/Property');
const User = require('../models/User');
const Document = require('../models/Document');
const { sendTenantInvitation } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const createLease = async (req, res) => {
  try {
    const { 
      tenantEmail, tenantFirstName, tenantLastName, 
      propertyId, unitNumber, startDate, endDate, rentAmount 
    } = req.body;

    // 1. Check if user exists, otherwise create a 'pending' tenant account
    let tenant = await User.findOne({ email: tenantEmail.toLowerCase() });
    const tempPassword = crypto.randomBytes(4).toString('hex');

    if (!tenant) {
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      tenant = await User.create({
        firstName: tenantFirstName,
        lastName: tenantLastName,
        email: tenantEmail.toLowerCase(),
        password: hashedPassword,
        role: 'tenant',
        isActive: true,
        emailVerified: false
      });
    }

    // 2. Create the Lease Record
    const lease = await Lease.create({
      landlordId: req.userId,
      tenantId: tenant._id,
      propertyId,
      unitNumber,
      startDate,
      endDate,
      rentAmount
    });

    // 3. Archive to Documents (For Landlord & Tenant)
    await Document.create([
      {
        title: `Lease Agreement - ${unitNumber}`,
        type: 'Lease',
        ownerId: req.userId, // Landlord copy
        relatedId: lease._id
      },
      {
        title: `My Lease - ${unitNumber}`,
        type: 'Lease',
        ownerId: tenant._id, // Tenant copy
        relatedId: lease._id
      }
    ]);

    // 4. Update Property Unit Status
    await Property.updateOne(
      { _id: propertyId, "units.unitNumber": unitNumber },
      { $set: { "units.$.status": "occupied" } }
    );

    // 5. Send Branded Email Invitation
    await sendTenantInvitation({
      tenantEmail: tenant.email,
      tenantName: tenant.firstName,
      landlordName: `${req.user?.firstName || 'Your Landlord'}`,
      propertyName: "Urugo Managed Property",
      unitNumber,
      rent: rentAmount,
      tempPassword,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
    });

    res.status(201).json({ success: true, lease });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLeases = async (req, res) => {
  try {
    const leases = await Lease.find({ landlordId: req.userId })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name address');
    res.status(200).json({ success: true, leases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLease, getMyLeases };