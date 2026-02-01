const Property = require('../models/Property');

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlordId: req.userId });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const { name, address, propertyType, units } = req.body;

    if (!name || !address || !propertyType) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const property = await Property.create({
      landlordId: req.userId,
      name,
      address,
      propertyType,
      units: units || []
    });

    res.status(201).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      landlordId: req.userId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      landlordId: req.userId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updates = req.body;
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({ success: true, property: updatedProperty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      landlordId: req.userId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty };