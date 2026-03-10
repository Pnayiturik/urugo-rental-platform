# Urugo Rental Management Platform

**A centralized digital rental management platform built for the Rwandan housing market.**

**Live Platform:** [urugorentals.com](https://urugorentals.com/) | **Video Demo:** [Watch Here](https://drive.google.com/file/d/1jvnPbN3lsTR2S10Mf6YFdyujYeeHnC2E/view?usp=drive_link) | **GitHub:** [Repository](https://github.com/Pnayiturik/urugo-rental-platform)

---

## Mission

Tackle the **lack of transparency and accountability** in the rental market by building a **centralized digital management platform** using full-stack web development, database management, and modern system architecture.

---

## Overview

Urugo is a comprehensive rental management solution designed to address the unique challenges of the Rwandan housing market. By digitizing the relationship between landlords and tenants, the platform replaces manual and spreadsheet-based processes with a secure, automated system built on trust and verified data.

- **Problem Solved:** Replaces manual/spreadsheet rental management with an automated, secure digital platform
- **GCGO Alignment:** Primary: Infrastructure | Secondary: Governance & Accountability
- **Status:** Fully Deployed & Operational

---

## Features

### For Landlords

- **Unified Property Management:** Add and manage multiple properties with individual units and real-time occupancy tracking.
- **Verified Tenant Onboarding:** Assign tenants from requests, automatically generating accounts with 16-digit National ID-linked profiles.
- **Digital Lease Generation:** Instant creation of professional Residential Rental Agreements, stored permanently in the digital archive.
- **Trust Score System:** Review tenant reliability based on Urugo payment history before approving requests.
- **Misconduct Tracking:** Record and monitor tenant violations to ensure property safety and community standards.

### For Tenants

- **Flutterwave Payment Portal:** Securely pay rent using Mobile Money (MoMo) or card through a dedicated tenant wallet.
- **Automated Receipts:** Access a full transaction history with downloadable digital receipts for every payment.
- **Lease Access:** View and download the active Digital Rental Agreement directly from the dashboard.
- **Secure Credentials:** First-time access via system-generated temporary passwords with a mandatory reset on first login.

---

## Technology Stack

### Frontend

- **React 19.2.0** — UI Framework
- **Vite** — Build Tool
- **Tailwind CSS** — Styling with custom `#54ab91` brand theme
- **Recharts** — Interactive revenue analytics

### Backend

- **Node.js & Express 5.2.1** — API layer
- **MongoDB & Mongoose 9.1.5** — Database
- **JWT & Bcryptjs** — Authentication & security
- **Nodemailer** — Automated tenant invitations

---

## Database Schema

### Leases & Agreements

```javascript
{
  landlordId: ObjectId,
  tenantId:   ObjectId,
  propertyId: ObjectId,
  unitNumber: String,
  rentAmount: Number,   // Source for Wallet balance
  nationalId: String,   // Rwandan NID Verification
  status: 'active' | 'terminated'
}
```

### Payments (Flutterwave Integrated)

```javascript
{
  tenantId:      ObjectId,
  amount:        Number,
  status:        'pending' | 'completed' | 'overdue',
  paymentMethod: 'flutterwave_momo' | 'card',
  transactionId: String
}
```

---

## Testing

### Strategies

- **Functional Testing:** Verified that the "Assign" trigger correctly transitions a `RentalRequest` into an active `Lease` and `Renter` record.
- **Data Value Testing:** Confirmed system stability when processing 16-digit National IDs and large RWF currency values in `Wallet.jsx`.
- **Cross-Platform Testing:** Verified on Chrome, Safari, and mobile viewports; `#54ab91` seafoam theme confirmed accessible and responsive.

### Results

- Automated tenant onboarding flow fully operational.
- Digital legal contracts successfully generated and archived.
- Database queries for landlord analytics load in under 2 seconds.

---

## Deployment

| Layer    | Provider      | Details                                      |
|----------|---------------|----------------------------------------------|
| Frontend | Netlify       | [urugorentals.com](https://urugorentals.com) |
| Backend  | Render.com    | Frankfurt region (proximity to Rwanda)       |
| Database | MongoDB Atlas | Cloud tier with automated backups            |

---

## Author

**Patrick Nayituriki**  
Bachelor of Science in Software Engineering  
African Leadership University  
[Pnayiturik@alustudent.com](mailto:Pnayiturik@alustudent.com)

---

*Last updated: March 2026*
