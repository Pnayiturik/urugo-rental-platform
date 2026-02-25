const Lease = require('../models/Lease');
const Property = require('../models/Property');
const User = require('../models/User');
const Document = require('../models/Document');
const { sendTenantInvitation } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.createLease = async (req, res) => {
  try {
    const { 
      tenantEmail, tenantFirstName, tenantLastName, 
      propertyId, unitNumber, startDate, endDate, rentAmount 
    } = req.body;

    // 1. Manage Tenant Account
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
        isActive: true
      });
    }

    // 2. Create Lease
    const lease = await Lease.create({
      landlordId: req.userId,
      tenantId: tenant._id,
      propertyId,
      unitNumber,
      startDate,
      endDate,
      rentAmount
    });

    // 3. Create Document Records (Case-sensitive 'Lease' for your Enum)
    await Document.create([
      {
        title: `Lease Agreement - ${unitNumber}`,
        type: 'Lease',
        ownerId: req.userId,
        relatedId: lease._id
      },
      {
        title: `My Lease - ${unitNumber}`,
        type: 'Lease',
        ownerId: tenant._id,
        relatedId: lease._id
      }
    ]);

    // 4. Update Property Status
    await Property.updateOne(
      { _id: propertyId, "units.unitNumber": unitNumber },
      { $set: { "units.$.status": "occupied" } }
    );

    // 5. Send Email
    const landlord = await User.findById(req.userId);
    await sendTenantInvitation({
      tenantEmail: tenant.email,
      tenantName: tenant.firstName,
      landlordName: landlord ? `${landlord.firstName} ${landlord.lastName}` : 'Your Landlord',
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

exports.getMyLeases = async (req, res) => {
  try {
    const leases = await Lease.find({ landlordId: req.userId })
      .populate('tenantId', 'firstName lastName email')
      .populate('propertyId', 'name address');
    res.status(200).json({ success: true, leases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTenantLease = async (req, res) => {
  try {
    const lease = await Lease.findOne({ tenantId: req.userId })
      .populate('landlordId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');
    
    if (!lease) return res.status(404).json({ message: 'No lease found' });
    res.status(200).json({ success: true, lease });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};