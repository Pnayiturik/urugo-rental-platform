const Lease = require('../models/Lease');

/**
 * Service to handle document-specific logic
 * Aligned with Urugo's goal of financial verification for banks.
 */
const generateLeaseDocument = async (leaseId) => {
  const lease = await Lease.findById(leaseId)
    .populate('landlordId', 'firstName lastName email phone')
    .populate('tenantId', 'firstName lastName email phone')
    .populate('propertyId', 'name address unitNumber propertyType');

  if (!lease) throw new Error('Lease not found');

  // Extract identities
  const landlordIdentity = lease.landlordIdentity || {};
  const tenantIdentity = lease.tenantIdentity || {};

  // This structure mimics a formal contract for the "Documents" tab
  return {
    title: `Lease Agreement - ${lease.propertyId.name}`,
    dateGenerated: new Date(),
    referenceNo: lease._id.toString().substring(0, 8).toUpperCase(),
    content: {
      parties: {
        landlord: {
          name: `${lease.landlordId.firstName} ${lease.landlordId.lastName}`,
          email: lease.landlordId.email,
          phone: lease.landlordId.phone || '[not provided]',
          systemId: lease.landlordId._id ? lease.landlordId._id.toString() : '[not provided]',
          nationalId: landlordIdentity.nationalId || '[not provided]',
          passportNumber: landlordIdentity.passportNumber || '[not provided]'
        },
        tenant: {
          name: `${lease.tenantId.firstName} ${lease.tenantId.lastName}`,
          email: lease.tenantId.email,
          phone: lease.tenantId.phone || '[not provided]',
          systemId: lease.tenantId._id ? lease.tenantId._id.toString() : '[not provided]',
          nationalId: tenantIdentity.nationalId || '[not provided]',
          passportNumber: tenantIdentity.passportNumber || '[not provided]'
        }
      },
      property: {
        name: lease.propertyId.name,
        unitNumber: lease.unitNumber || lease.propertyId.unitNumber || '[not provided]',
        address: lease.propertyId.address ? `${lease.propertyId.address.street}, ${lease.propertyId.address.city}, ${lease.propertyId.address.district || ''}, ${lease.propertyId.address.country || 'Rwanda'}` : '[not provided]',
        propertyType: lease.propertyId.propertyType || '[not provided]'
      },
      terms: lease.terms,
      rent: `${lease.rentAmount} RWF`,
      duration: `${new Date(lease.startDate).toLocaleDateString()} to ${new Date(lease.endDate).toLocaleDateString()}`
    }
  };
};

module.exports = { generateLeaseDocument };