const TenantIncident = require('../models/TenantIncident');

const reportTenantIncident = async (req, res) => {
  try {
    if (req.user?.role !== 'landlord') return res.status(403).json({ message: 'Only landlords can report incidents' });

    const landlordId = req.user?._id || req.user?.id;
    const { tenant, property, type, severity, amount, description } = req.body;

    const incident = await TenantIncident.create({
      tenant,
      landlord: landlordId,
      property,
      type,
      severity: severity || 'minor',
      amount: Number(amount) || 0,
      description,
      resolved: false
    });

    return res.status(201).json(incident);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getTenantIncidentSummary = async (req, res) => {
  try {
    if (!['landlord', 'admin'].includes(req.user?.role)) return res.status(403).json({ message: 'Forbidden' });

    const incidents = await TenantIncident.find({ tenant: req.params.tenantId, resolved: false });
    const totalDebt = incidents.filter(i => i.type === 'debt').reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const seriousMisconduct = incidents.some(i => i.severity === 'serious' || i.type === 'legal');

    return res.json({
      openIncidents: incidents.length,
      totalDebt,
      seriousMisconduct,
      incidents
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { reportTenantIncident, getTenantIncidentSummary };