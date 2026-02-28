const Lease = require('../models/Lease');
const Property = require('../models/Property');
const User = require('../models/User');
const Document = require('../models/Document');
const { sendTenantInvitation } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

exports.createLease = async (req, res) => {
  try {
    console.log('📝 Creating lease with data:', req.body);
    console.log('🔌 Database connection state:', mongoose.connection.readyState); // 1 = connected, 0 = disconnected
    console.log('🗄️  Connected to database:', mongoose.connection.name);
    
    // Check current database state
    const userCountBefore = await User.countDocuments();
    const leaseCountBefore = await Lease.countDocuments();
    console.log('📊 BEFORE: Users in DB:', userCountBefore, '| Leases in DB:', leaseCountBefore);
    
    const { 
      tenantEmail, tenantFirstName, tenantLastName, 
      propertyId, unitNumber, startDate, endDate, rentAmount, terms 
    } = req.body;

    // 1. Manage Tenant Account
    let tenant = await User.findOne({ email: tenantEmail.toLowerCase() });
    const tempPassword = crypto.randomBytes(4).toString('hex');

    if (!tenant) {
      console.log('🆕 Creating NEW tenant user for:', tenantEmail);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      tenant = await User.create({
        firstName: tenantFirstName,
        lastName: tenantLastName,
        email: tenantEmail.toLowerCase(),
        password: hashedPassword,
        role: 'tenant',
        isActive: true
      });
      
      console.log('✅ Tenant CREATED:', tenant._id);
      console.log('📧 Email:', tenant.email);
      console.log('🔑 Temp Password:', tempPassword);
      
      // Verify it was actually saved
      const verifyTenant = await User.findById(tenant._id);
      if (!verifyTenant) {
        console.error('⚠️ WARNING: Tenant created but NOT FOUND in database!');
        console.error('Database connection issue or buffering problem!');
      } else {
        console.log('✅ VERIFIED: Tenant exists in database');
      }
    } else {
      console.log('👤 Tenant ALREADY EXISTS:', tenant._id);
      console.log('📧 Existing email:', tenant.email);
      console.log('⚠️ NOT creating new user, NOT updating password');
    }

    // 2. Create Lease
    console.log('📋 Creating lease for tenant:', tenant._id);
    const lease = await Lease.create({
      landlordId: req.userId,
      tenantId: tenant._id,
      propertyId,
      unitNumber,
      startDate,
      endDate,
      rentAmount,
      terms: terms || 'Standard Urugo Rental Agreement: Tenant agrees to pay rent on time via MoMo/Airtel.'
    });
    console.log('✅ Lease CREATED:', lease._id);
    console.log('📄 Lease terms saved:', lease.terms);
    
    // Verify lease was saved
    const verifyLease = await Lease.findById(lease._id);
    if (!verifyLease) {
      console.error('⚠️ WARNING: Lease created but NOT FOUND in database!');
    } else {
      console.log('✅ VERIFIED: Lease exists in database');
    }

    // 3. Create Document Records (Case-sensitive 'Lease' for your Enum)
    const documents = await Document.create([
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
    console.log('✅ Documents created:', documents.length);

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
    console.log('✅ Email sent successfully');

    // Final verification
    const userCountAfter = await User.countDocuments();
    const leaseCountAfter = await Lease.countDocuments();
    console.log('📊 AFTER: Users in DB:', userCountAfter, '| Leases in DB:', leaseCountAfter);
    console.log('📈 Changes: Users +', (userCountAfter - userCountBefore), '| Leases +', (leaseCountAfter - leaseCountBefore));

    res.status(201).json({ success: true, lease });
  } catch (error) {
    console.error('❌ LEASE CREATION FAILED:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error code:', error.code);
    console.error('❌ Full error:', error);
    
    // Check if it's a MongoDB error
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('⚠️ DATABASE ERROR DETECTED');
      if (error.code === 11000) {
        console.error('⚠️ Duplicate key error - User or Lease already exists');
      }
    }
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('⚠️ VALIDATION ERROR:', error.errors);
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message,
      errorType: error.name 
    });
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
    console.log('🔍 Fetching lease for tenant:', req.userId);
    const lease = await Lease.findOne({ tenantId: req.userId })
      .populate('landlordId', 'firstName lastName email phone')
      .populate('propertyId', 'name address');
    
    if (!lease) {
      console.log('❌ No lease found for tenant:', req.userId);
      return res.status(404).json({ message: 'No lease found' });
    }
    
    console.log('✅ Lease found:', lease._id);
    console.log('📄 Lease terms being sent:', lease.terms);
    res.status(200).json({ success: true, lease });
  } catch (error) {
    console.error('❌ Error fetching tenant lease:', error);
    res.status(500).json({ message: error.message });
  }
};