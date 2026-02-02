const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Property = require('../models/Property');
const bcrypt = require('bcryptjs');
const { sendTenantInvitation } = require('../services/emailService');

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
};

const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ landlordId: req.userId })
      .populate('userId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');
    res.status(200).json({ success: true, tenants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTenant = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      propertyId, 
      unitId, 
      leaseStart, 
      leaseEnd, 
      rentAmount, 
      emergencyContact 
    } = req.body;

    if (!firstName || !lastName || !email || !propertyId || !unitId || !rentAmount) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const property = await Property.findOne({ _id: propertyId, landlordId: req.userId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const unit = property.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    if (unit.status === 'occupied') {
      return res.status(400).json({ message: 'Unit is already occupied' });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'tenant',
      emailVerified: false
    });

    const tenant = await Tenant.create({
      userId: newUser._id,
      landlordId: req.userId,
      propertyId,
      unitId,
      leaseStart,
      leaseEnd,
      rentAmount,
      emergencyContact,
      status: 'active'
    });

    unit.status = 'occupied';
    await property.save();

    const landlord = await User.findById(req.userId);
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    try {
      const emailResult = await sendTenantInvitation({
        tenantEmail: email,
        tenantName: `${firstName} ${lastName}`,
        landlordName: `${landlord.firstName} ${landlord.lastName}`,
        propertyName: property.name,
        unitNumber: unit.unitNumber,
        rent: rentAmount,
        tempPassword,
        loginUrl
      });

      console.log('📧 Email preview URL:', emailResult.previewUrl);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    const populatedTenant = await Tenant.findById(tenant._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');

    res.status(201).json({ 
      success: true, 
      tenant: populatedTenant,
      tempPassword,
      message: 'Tenant created and invitation email sent'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.userId })
      .populate('userId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json({ success: true, tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.userId });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const updates = req.body;
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('userId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');

    res.status(200).json({ success: true, tenant: updatedTenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, landlordId: req.userId });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.propertyId && tenant.unitId) {
      const property = await Property.findById(tenant.propertyId);
      if (property) {
        const unit = property.units.id(tenant.unitId);
        if (unit) {
          unit.status = 'vacant';
          await property.save();
        }
      }
    }

    await User.findByIdAndDelete(tenant.userId);
    await Tenant.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Tenant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTenants, createTenant, getTenantById, updateTenant, deleteTenant };