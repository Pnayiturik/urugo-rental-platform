const Lease = require('../models/Lease');

/**
 * Service to handle document-specific logic
 * Aligned with Urugo's goal of financial verification for banks.
 */
const generateLeaseDocument = async (leaseId) => {
  const lease = await Lease.findById(leaseId)
    .populate('landlordId', 'firstName lastName email')
    .populate('tenantId', 'firstName lastName email')
    .populate('propertyId', 'name address');

  if (!lease) throw new Error('Lease not found');

  // This structure mimics a formal contract for the "Documents" tab
  return {
    title: `Lease Agreement - ${lease.propertyId.name}`,
    dateGenerated: new Date(),
    referenceNo: lease._id.toString().substring(0, 8).toUpperCase(),
    content: {
      parties: {
        landlord: `${lease.landlordId.firstName} ${lease.landlordId.lastName}`,
        tenant: `${lease.tenantId.firstName} ${lease.tenantId.lastName}`
      },
      terms: lease.terms,
      rent: `${lease.rentAmount} RWF`,
      duration: `${new Date(lease.startDate).toLocaleDateString()} to ${new Date(lease.endDate).toLocaleDateString()}`
    }
  };
};

module.exports = { generateLeaseDocument };