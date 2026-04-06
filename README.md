# Urugo Rental Management Platform (URMP)

A localized, mobile-first digital rental management platform built for 
Rwanda's housing market. Urugo integrates National ID tenant verification, 
automated digital lease generation, and Mobile Money payment tracking into 
a single self-service workflow for landlords and tenants in Kigali.

---

## Project Overview

Urugo addresses the transparency and accountability gap in Rwanda's 
informal rental sector by providing:
- 16-digit Rwandan National ID tenant verification
- Automated PDF lease agreement generation upon landlord approval
- Real-time rent payment tracking via MTN MoMo and Airtel Money 
  (Flutterwave integration)
- Role-based dashboards for landlords and tenants
- A chronological, non-editable payment ledger for both parties

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Payment | Flutterwave (MTN MoMo, Airtel Money) |
| Authentication | JWT, Bcrypt |
| PDF Generation | pdfkit |
| Email Notifications | Nodemailer |
| Hosting | Vercel (frontend), Render (backend) |

---

## Installation and Local Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account
- Flutterwave account (for payment API keys)
- Git

### Steps

1. Clone the repository
git clone https://github.com/Pnayiturik/urugo-rental-platform.git
cd urugo-rental-platform

2. Install backend dependencies
cd backend
npm install

3. Install frontend dependencies
cd ../frontend
npm install

4. Configure environment variables
Copy the .env.example file in the backend folder and rename it to .env
Fill in all required values as described in the section below

5. Run the backend server
cd backend
npm run dev

6. Run the frontend
cd ../frontend
npm start

7. Open your browser and navigate to http://localhost:3000

---

## Environment Variables

Create a .env file in the backend directory using the following template:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret
EMAIL_USER=your_nodemailer_email_address
EMAIL_PASS=your_nodemailer_email_password

---

## API Endpoints

### Authentication
POST /api/auth/register - Register a new user (landlord or tenant)
POST /api/auth/login - Login and receive JWT token

### Properties
GET /api/properties - Get all listed properties
POST /api/properties - Create a new property listing (landlord only)
GET /api/properties/:id - Get a specific property

### Rental Requests
POST /api/requests - Submit a rental request (tenant only)
GET /api/requests - Get all requests (landlord only)
PUT /api/requests/:id/approve - Approve a rental request (landlord only)

### Payments
POST /api/payments/initiate - Initiate a MoMo payment (tenant only)
POST /api/payments/webhook - Flutterwave webhook listener
GET /api/payments - Get payment history

### Leases
GET /api/leases - Get all leases for the logged-in user
GET /api/leases/:id/download - Download lease PDF

---

## Running Tests

From the backend directory:
npm test

Tests cover:
- National ID format validation (unit tests)
- Frontend input validation (validation tests)
- Flutterwave webhook integration (integration tests)
- Full end-to-end rental workflow (system tests)

---

## Deployment

Frontend is deployed on Vercel:
- Connect your GitHub repository to Vercel
- Set the root directory to /frontend
- Add environment variables in Vercel dashboard

Backend is deployed on Render:
- Connect your GitHub repository to Render
- Set the root directory to /backend
- Add all .env variables in the Render environment settings
- Set start command to: npm start

Live platform: https://urugorentals.com

---

## Author

Patrick Nayituriki
BSc. Software Engineering
African Leadership University
Supervisor: Pelin Mutanguha
2026
