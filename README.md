# Urugo Rental Management Platform

**A centralized digital rental management platform built for the Rwandan housing market.**

**Live Platform:** [urugorentals.com](https://urugorentals.com/) | **Video Demo:** [Watch Here](https://drive.google.com/file/d/1jvnPbN3lsTR2S10Mf6YFdyujYeeHnC2E/view?usp=drive_link) | **GitHub:** [Repository](https://github.com/Pnayiturik/urugo-rental-platform)

---

## Mission

Tackle the **lack of transparency and accountability** in the rental market by building a **centralized digital management platform** using full-stack web development, database management, and modern system architecture.

---

## Overview

Urugo is a comprehensive rental management solution designed to address the unique challenges of the Rwandan housing market. We digitize the landlord-tenant relationship, replacing manual, spreadsheet-based processes with a secure, automated system built on trust and verified data.

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

## Screenshots

### 1. Landing Page
<img width="1917" height="870" alt="landing page" src="https://github.com/user-attachments/assets/f6b2d26b-f09e-4ab2-a17d-43b09e591455" />

### 2. Login & Authentication
<img width="1918" height="867" alt="sign in" src="https://github.com/user-attachments/assets/bc0dde31-85c9-4975-9606-dbae7d6cb884" />

### 3. Landlord Dashboard (Analytics & Revenue)
<img width="1918" height="870" alt="landlord dashboard" src="https://github.com/user-attachments/assets/2283219c-49bf-49d4-ba90-ae244d663492" />

### 4. Tenant Management & Renters List
<img width="1902" height="867" alt="tenant home" src="https://github.com/user-attachments/assets/9c678ed8-a855-47ef-a49a-964c0a4f092c" />

### 5. Payment Portal & Wallet
<img width="1899" height="864" alt="Screenshot 2026-03-10 085458" src="https://github.com/user-attachments/assets/88213c4a-6ceb-48b2-b0a2-2174e5d7abaa" />
<img width="1895" height="879" alt="Screenshot 2026-03-10 085614" src="https://github.com/user-attachments/assets/3f238922-d208-4ce5-adaf-fb3c5c292be7" />


### 6. Lease & Agreement View
<img width="1919" height="867" alt="Screenshot 2026-03-10 085757" src="https://github.com/user-attachments/assets/cf645cea-6b88-4789-9203-a52355bbb669" />
<img width="1895" height="856" alt="Screenshot 2026-03-10 090110" src="https://github.com/user-attachments/assets/1125edae-bfc7-4b7f-ac2a-bc657051a624" />
<img width="612" height="716" alt="Screenshot 2026-03-10 085959" src="https://github.com/user-attachments/assets/0070ed1e-7bdd-4a0e-919f-e5f6a460881e" />

---

## Author

**Patrick Nayituriki**  
Bachelor of Science in Software Engineering  
African Leadership University  
[Pnayiturik@alustudent.com](mailto:Pnayiturik@alustudent.com)

---

*Last updated: March 2026*
