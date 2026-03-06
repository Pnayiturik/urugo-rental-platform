const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Property = require('../models/Property');
const { sendEmail } = require('../services/emailService'); // adapt to your service

const generateTempPassword = () => crypto.randomBytes(6).toString('base64url'); // ~8-10 chars

exports.assignTenantToUnit = async (req, res) => {
  try {
    const landlordId = req.user._id;
    const { propertyId, unitId, tenantEmail, tenantName } = req.body;

    const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const unit = property.units.id(unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    let tenant = await User.findOne({ email: tenantEmail.toLowerCase() });

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    if (!tenant) {
      tenant = await User.create({
        name: tenantName || tenantEmail.split('@')[0],
        email: tenantEmail.toLowerCase(),
        role: 'tenant',
        password: hashed,
        canLogin: true,
        mustChangePassword: true,
        invitedByLandlord: landlordId
      });
    } else {
      tenant.password = hashed;
      tenant.role = 'tenant';
      tenant.canLogin = true;
      tenant.mustChangePassword = true;
      tenant.invitedByLandlord = landlordId;
      await tenant.save();
    }

    unit.tenant = tenant._id; // adapt field name to your schema
    unit.status = 'occupied';
    await property.save();

    await sendEmail({
      to: tenant.email,
      subject: 'Urugo Tenant Access Activated',
      text: `You have been assigned to ${property.name}. Temporary password: ${tempPassword}. Please log in and change your password immediately.`
    });

    return res.status(200).json({ message: 'Tenant assigned and invite email sent' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};