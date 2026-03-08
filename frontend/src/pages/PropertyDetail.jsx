import React, { useState } from 'react';
import { createRentalRequest } from '../api/rentalRequests';
import { property } from '../data/property';

const [formData, setFormData] = useState({
  requestedUnit: '',
  idType: 'nationalId',
  idNumber: '',
  message: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const submitRequest = async (e) => {
  e.preventDefault();
  try {
    await createRentalRequest({
      ...formData,
      nationalId: formData.idNumber,
      propertyId: property?._id || id
    });
    alert('Request sent successfully');
  } catch (err) {
    alert(err?.response?.data?.message || err.message || 'Failed to send request');
  }
};

return (
  <form onSubmit={submitRequest}>
    <div>
      <label>Requested Unit:</label>
      <input type="text" value={formData.requestedUnit} onChange={(e) => setFormData({...formData, requestedUnit: e.target.value})} />
    </div>
    <div>
      <label>ID Type:</label>
      <select value={formData.idType} onChange={(e) => setFormData({...formData, idType: e.target.value})}>
        <option value="nationalId">National ID</option>
        <option value="passport">Passport</option>
      </select>
    </div>
    <div>
      <label>ID Number:</label>
      <input type="text" value={formData.idNumber} onChange={(e) => setFormData({...formData, idNumber: e.target.value})} />
    </div>
    <div>
      <label>Message:</label>
      <input type="text" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
    </div>
    <div>
      <label>First Name:</label>
      <input placeholder="First name" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName:e.target.value})} required />
    </div>
    <div>
      <label>Last Name:</label>
      <input placeholder="Last name" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName:e.target.value})} required />
    </div>
    <div>
      <label>Email:</label>
      <input type="email" placeholder="Email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} required />
    </div>
    <div>
      <label>Phone:</label>
      <input placeholder="Phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required />
    </div>
    <button type="submit">Submit Request</button>
  </form>
);