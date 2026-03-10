# Urugo Rental Management Platform 🇷🇼

*GitHub Repository: [https://github.com/Pnayiturik/urugo-rental-platform](https://github.com/Pnayiturik/urugo-rental-platform)* *Video Demo: [https://drive.google.com/file/d/1jvnPbN3lsTR2S10Mf6YFdyujYeeHnC2E/view?usp=drive_link](https://drive.google.com/file/d/1jvnPbN3lsTR2S10Mf6YFdyujYeeHnC2E/view?usp=drive_link)* *Live Platform: **[https://urugorentals.com/](https://urugorentals.com/)***

## Mission Statement
My mission is to tackle the **lack of transparency and accountability** in the rental market by developing a **centralized digital management platform** using my skills in **full-stack web development, database management, and system architecture.**

---

## Description
Urugo is a comprehensive rental management solution designed to address the unique challenges of the Rwandan housing market. By digitizing the relationship between landlords and tenants, the platform replaces manual processes with a secure, automated system built on trust and verified data.

**Problem Solved:** Replaces manual or spreadsheet-based rental management with an automated, secure digital platform.  
**GCGO Alignment:** Primary: **Infrastructure** | Secondary: **Governance and Accountability**.

---

## Key Features

### For Landlords
- **Unified Property Management:** Add and manage multiple properties with individual units and real-time occupancy tracking.
- **Verified Tenant Onboarding:** Assign tenants directly from requests, automatically generating their accounts and 16-digit National ID-linked profiles.
- **Digital Lease Generation:** Instant creation of professional Residential Rental Agreements, stored permanently in the digital archive.
- **Trust Score System:** Review tenant reliability based on their Urugo payment history before approving requests.
- **Misconduct Tracking:** Record and monitor tenant violations to ensure property safety and community standards.

### For Tenants
- **Flutterwave Payment Portal:** Securely pay rent using Mobile Money (MoMo) or Cards through a dedicated tenant wallet.
- **Automated Receipts:** Access a complete transaction history with downloadable digital receipts for every payment.
- **Lease Access:** View and download the active Digital Rental Agreement directly from the dashboard.
- **Secure Credentials:** First-time access via system-generated temporary passwords with a mandatory reset required on the first login.

---

## Technology Stack

### Frontend
- **React 19.2.0** (UI Framework)
- **Vite** (Build Tool)
- **Tailwind CSS** (Custom #54ab91 Brand Theme)
- **Recharts** (Interactive Revenue Analytics)

### Backend
- **Node.js & Express 5.2.1** (API Layer)
- **MongoDB & Mongoose 9.1.5** (Database)
- **JWT & Bcryptjs** (Authentication & Security)
- **Nodemailer** (Automated Tenant Invitations)

---

## Database Schema Highlights

### Leases & Agreements
```javascript
{
  landlordId: ObjectId,
  tenantId: ObjectId,
  propertyId: ObjectId,
  unitNumber: String,
  rentAmount: Number, // Source for Wallet balance
  nationalId: String, // Rwandan NID Verification
  status: 'active' | 'terminated'
}
Payments (Flutterwave Integrated)
JavaScript
{
  tenantId: ObjectId,
  amount: Number,
  status: 'pending' | 'completed' | 'overdue',
  paymentMethod: 'flutterwave_momo' | 'card',
  transactionId: String
}
## Testing Results & Analysis

### Testing Strategies
The system underwent rigorous testing to ensure reliability across the Rwandan rental context:
- **Functional Testing**: Verified that the "Assign" trigger correctly transitions a `RentalRequest` into an active `Lease` and `Renter` record.
- **Data Value Testing**: Confirmed system stability when processing 16-digit National IDs and large currency values (RWF) in the `Wallet.jsx` component.
- **Cross-Platform Testing**: Functionality verified on Chrome, Safari, and mobile viewports to ensure the #54ab91 seafoam theme remains accessible and responsive.

### Project Analysis
- **Objectives Met**: Successfully automated the tenant onboarding flow and digitized legal contracts, achieving the primary project goal of increasing market transparency.
- **Performance**: Database queries for landlord analytics were optimized to load within < 2 seconds, meeting professional specification requirements.

---

## Deployment Plan
- **Frontend**: Netlify (Deployed at **[urugorentals.com](https://urugorentals.com)**)
- **Backend**: Render.com (Frankfurt Region for proximity to Rwanda)
- **Database**: MongoDB Atlas (Cloud Tier with automated backups)
- **Status**: **Fully Deployed & Operational**

---

## Contact
**Patrick Nayituriki** Bachelor of Science in Software Engineering  
**African Leadership University** Email: [Pnayiturik@alustudent.com](mailto:Pnayiturik@alustudent.com)  

**Last Updated:** March 2026
