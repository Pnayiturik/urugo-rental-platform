# Urugo Rental Management Platform

A web-based rental property management system designed for landlords and tenants in Rwanda. The platform streamlines property management, tenant tracking, and rent payment processing.

## Overview

Urugo helps landlords manage multiple properties and tenants while providing tenants with an easy way to view their rental information and make payments. The system is built with modern web technologies and designed specifically for the Rwandan rental market.

## Features

### For Landlords
- **Property Management** - Add and manage multiple properties with individual units
- **Tenant Management** - Track tenant information, lease details, and payment status
- **Payment Tracking** - Monitor rent payments and view payment history
- **Dashboard Analytics** - Overview of properties, tenants, and revenue

### For Tenants
- **Property Information** - View assigned property and unit details
- **Payment Portal** - Make rent payments and view payment history
- **Payment Records** - Access all transaction records

### Current Implementation Status
✅ User authentication (login/register)  
✅ Property CRUD operations  
✅ Tenant CRUD operations  
✅ Payment tracking and history (still working on, but almost done) 
✅ Dashboard with analytics  
🚧 Mobile money integration (using some url sms )  
🚧 Email notifications (configured but not fully tested)
🚧 lease agreements 

## Technology Stack

### Frontend
- **React** 19.2.0 - UI framework
- **Vite** - Build tool and development server
- **Recharts** - Dashboard charts
- **React Hook Form** - Form handling
- **React Toastify** - Notifications

### Backend
- **Node.js** with **Express** 5.2.1
- **MongoDB** with **Mongoose** 9.1.5 - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Express Validator** - Input validation

## Project Structure

```
urugo-rental-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── context/        # React context (auth, etc)
│   │   └── styles/         # CSS files
│   └── package.json
│
├── backend/
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation, etc
│   └── package.json
│
└── README.md
```

## Database Schema

### Users
```javascript
{
  email: String,
  password: String (hashed),
  fullName: String,
  phoneNumber: String,
  role: 'landlord' | 'tenant'
}
```

### Properties
```javascript
{
  landlordId: ObjectId,
  name: String,
  address: {
    street: String,
    city: String,
    district: String,
    country: String
  },
  propertyType: 'apartment' | 'house' | 'commercial',
  units: [{
    unitNumber: String,
    bedrooms: Number,
    bathrooms: Number,
    rent: Number,
    status: 'vacant' | 'occupied' | 'maintenance'
  }]
}
```

### Tenants
```javascript
{
  userId: ObjectId,
  landlordId: ObjectId,
  propertyId: ObjectId,
  unitId: String,
  leaseStart: Date,
  leaseEnd: Date,
  rentAmount: Number,
  status: 'active' | 'inactive' | 'pending'
}"still working on it"
```

### Payments
```javascript
{
  tenantId: ObjectId,
  landlordId: ObjectId,
  amount: Number,
  dueDate: Date,
  paidDate: Date,
  paymentMethod: String,
  status: 'pending' | 'completed' | 'overdue'
}"still working on it"
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Pnayiturik/urugo-rental-platform.git
cd urugo-rental-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urugo_rental
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Remove tenant

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `GET /api/payments/tenant/:tenantId` - Get tenant payments

## Future Enhancements

### Planned Features
- Mobile money integration (MTN Mobile Money, Airtel Money)
- Automated email notifications for rent reminders
- PDF receipt generation
- Advanced analytics and reporting
- SMS notifications
- Property image uploads
- Maintenance request tracking

### Deployment Plan
- Backend: Render
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas
- Domain: Custom domain with SSL

## Screenshots

<img width="1905" height="905" alt="1" src="https://github.com/user-attachments/assets/e546fc74-b3b5-4490-a477-cb5367605f3a" />
<img width="1913" height="911" alt="homedashboard" src="https://github.com/user-attachments/assets/ea0e4e38-1649-404d-b52c-607b04683da5" />
<img width="1912" height="910" alt="renterslandlord" src="https://github.com/user-attachments/assets/c203d2c0-cdc6-436c-92d9-e10759816b88" />
"uploaded a few as others are still in progress, plus planning to recharge some colors"



## Development Notes

- Built with mobile-responsive design
- Uses JWT for secure authentication
- Role-based access control (landlord/tenant)
- RESTful API architecture
- Input validation on both frontend and backend

## Contact

- **Developer**: Patrick nayituriki
- **Email**: Pnayiturik@alustudent.com
- **GitHub**: https://github.com/Pnayiturik

---

**Project Status**: In Development  
**Last Updated**: February 2026
