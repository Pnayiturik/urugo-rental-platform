# Urugo Rental Management Platform

GitHub Repository(https://github.com/Pnayiturik/urugo-rental-platform)

A web-based rental property management system designed for landlords and tenants in Rwanda. The platform streamlines property management, tenant tracking, and rent payment processing.

## Description

Urugo is a comprehensive rental management solution that addresses the challenges faced by landlords and tenants in Rwanda's rental market. The platform provides:

**For Landlords:**
- Centralized management of multiple properties and rental units
- Real-time tracking of tenant information and lease agreements
- Automated payment monitoring with overdue tracking
- Financial analytics and revenue insights through interactive dashboards
- tenants misconduct tracking
- Digital record-keeping for all transactions and tenant communications

**For Tenants:**
- Easy access to rental property information and lease details
- Convenient payment portal for rent transactions
- Complete payment history and receipt records
- Direct communication channel with landlords
- maintenance request(future implementation due to time we have)

The system is built with security in mind, featuring JWT-based authentication, role-based access control, and encrypted password storage. It's designed to work seamlessly across desktop,but also have future plans to make it available on tablet and mobile devices, making property management accessible anywhere.

**Target Users:** Property owners, real estate managers, and tenants in Rwanda  
**Problem Solved:** Replaces manual/spreadsheet-based rental management with an automated, secure digital platform  
**Key Benefit:** Reduces administrative overhead and improves communication between landlords and tenants

---

## Features

### For Landlords
- **Property Management** - Add and manage multiple properties with individual units
- **Tenant Management** - Track tenant information, lease details, and payment status
- **Payment Tracking** - Monitor rent payments and view payment history
- **tenants miscoduct** - recording tenant's misconducts
- **Dashboard Analytics** - Overview of properties, tenants, and revenue

### For Tenants
- **Property Information** - View assigned property and unit details
- **Payment Portal** - Make rent payments and view payment history
- **Payment Records** - Access all transaction records

### Current Implementation Status
✅ User authentication (login/register)  
✅ Property CRUD operations  
✅ Tenant CRUD operations  
✅ Dashboard with analytics  
🚧 Payment tracking and history (almost done)  
🚧 misconduct tracking and history  
🚧 Mobile money integration (using SMS URL)  
🚧 Email notifications (configured but not fully tested)  
🚧 Lease agreements (in progress)

---

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

---

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

---

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
}
// Note: Still working on full implementation
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
}
// Note: Still working on full implementation
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Pnayiturik/urugo-rental-platform.git
cd urugo-rental-platform
```

#### 2. Backend Setup
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

#### 3. Frontend Setup
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

---

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

---

## Design & Screenshots

### Design Approach
The application features a **modern, clean interface** with a blue gradient theme(planning to change color styles after everything is working as i want) designed for professional property management. The UI is built with:
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Intuitive Navigation:** Easy-to-use interface for both landlords and tenants
- **Clean Typography:** Readable fonts and proper spacing
- **Visual Hierarchy:** Important information stands out

**Current Status:** Core UI implemented, color scheme refinement in progress

### Application Screenshots

#### 1. Login/Authentication Page
<img width="1905" height="905" alt="Login and Registration Interface" src="https://github.com/user-attachments/assets/e546fc74-b3b5-4490-a477-cb5367605f3a" />

*Secure authentication system with modern design, supporting both landlord and tenant login*

---

#### 2. Landlord Dashboard
<img width="1913" height="911" alt="Landlord Home Dashboard" src="https://github.com/user-attachments/assets/ea0e4e38-1649-404d-b52c-607b04683da5" />

*Overview dashboard showing key metrics: total properties, active tenants, revenue analytics, and recent transactions*

---

#### 3. Tenant Management
<img width="1912" height="910" alt="Tenant/Renter Management Interface" src="https://github.com/user-attachments/assets/c203d2c0-cdc6-436c-92d9-e10759816b88" />

*Landlord view for managing tenants, viewing payment status, and tracking lease information*

---

**Additional Screenshots:** Property management, payment portal, and tenant dashboard screenshots will be added as these features are finalized.

**Design Notes:**
- blue(purple) gradient theme for modern, professional look
- Responsive cards and grid layouts
- Interactive charts using Recharts library
- Color refinements planned for better contrast and accessibility

---

## Deployment Plan

### Current Status
The application is currently running in **development mode** on local machines. The deployment to production will follow a phased approach to ensure stability and proper configuration.

### Phase 1: Pre-Deployment Preparation (Week 1)

**Tasks:**
- [ ] Complete all core features (payments, lease agreements)
- [ ] Comprehensive testing of all features
- [ ] Code review and optimization
- [ ] Set up production MongoDB Atlas cluster (free tier: 512MB)
- [ ] Prepare production environment variables
- [ ] Create deployment documentation

**Deliverables:**
- Fully tested application
- Production-ready codebase
- Environment configuration files

---

### Phase 2: Database Setup (Week 1)

**Platform: MongoDB Atlas**

**Steps:**
1. Create MongoDB Atlas account (free tier)
2. Create new cluster (shared/free tier)
3. Configure network access (whitelist IPs)
4. Create database user with strong password
5. Get connection string
6. Test connection from local environment
7. Set up automated backups (included in free tier)

**Configuration:**
```
Database: MongoDB Atlas (Free Tier - 512MB)
Region: Closest to Rwanda (Europe/Middle East)
Backup: Automated daily backups
Access: IP whitelist + strong authentication
```

---

### Phase 3: Backend Deployment (Week 2)

**Platform: Render.com**

**Why Render:**
- Free tier available ($0/month)
- Automatic HTTPS/SSL certificates
- Easy GitHub integration
- Auto-deploy on git push
- Good for Node.js applications

**Deployment Steps:**

1. **Prepare Backend:**
   ```bash
   # Ensure package.json has correct scripts
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

2. **Create Render Account:**
   - Sign up at render.com
   - Connect GitHub account
   - Authorize Render to access repository

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Select GitHub repository
   - Configure settings:
     - **Name:** urugo-rental-api
     - **Region:** Frankfurt (closest to Rwanda)
     - **Branch:** main
     - **Root Directory:** backend
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Add Environment Variables:**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your-atlas-connection-string>
   JWT_SECRET=<generate-secure-random-string>
   JWT_EXPIRE=7d
   FRONTEND_URL=https://urugo-rental.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail>
   EMAIL_PASSWORD=<app-specific-password>
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete
   - Get deployment URL (e.g., `urugo-rental-api.onrender.com`)

6. **Test API:**
   ```bash
   curl https://urugo-rental-api.onrender.com/api/health
   ```

**Expected Result:** Backend API running at `https://urugo-rental-api.onrender.com`

---

### Phase 4: Frontend Deployment (Week 2)

**Platform: Vercel**

**Why Vercel:**
- Free tier with excellent performance
- Optimized for React/Vite applications
- Automatic SSL certificates
- Global CDN distribution
- Preview deployments for testing

**Deployment Steps:**

1. **Update Frontend Configuration:**
   
   Create `.env.production` file in frontend folder:
   ```env
   VITE_API_URL=https://urugo-rental-api.onrender.com/api
   ```

2. **Test Production Build Locally:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

3. **Deploy to Vercel:**
   
   **Via Vercel Dashboard:**
   - Sign up at vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Select repository
   - Configure:
     - **Framework Preset:** Vite
     - **Root Directory:** frontend
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Environment Variables:** Add `VITE_API_URL`
   - Click "Deploy"

4. **Get Deployment URL:**
   - Vercel provides URL: `urugo-rental.vercel.app`
   - Can add custom domain later

**Expected Result:** Frontend running at `https://urugo-rental.vercel.app`

---

### Phase 5: Testing & Verification (Week 3)

**Testing Checklist:**
- [ ] User registration works
- [ ] User login works
- [ ] Property CRUD operations work
- [ ] Tenant CRUD operations work
- [ ] Payment tracking works
- [ ] Dashboard loads correctly
- [ ] API calls succeed from frontend to backend
- [ ] CORS is properly configured
- [ ] Mobile responsiveness works
- [ ] All images/assets load correctly

**Load Testing:**
- Test with multiple concurrent users
- Verify response times (<2 seconds)
- Check database query performance

---

### Phase 6: Domain & SSL (Optional - Future)

**If Custom Domain Needed:**

1. **Purchase Domain:**
   - Namecheap, Google Domains (~$10-15/year)
   - Suggested: `urugorental.com` or `urugo.rw`

2. **Configure DNS:**
   ```
   A Record: @ → Point to Vercel
   CNAME: api → urugo-rental-api.onrender.com
   ```

3. **SSL Certificate:**
   - Automatic with Render and Vercel
   - No manual configuration needed

---

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Users (Browsers/Mobile)          │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTPS
                   │
        ┌──────────▼──────────┐
        │                      │
┌───────▼────────┐    ┌───────▼────────┐
│   Frontend      │    │   Backend       │
│   (Vercel)      │◄───┤   (Render)      │
│   React + Vite  │    │   Node + Express│
└─────────────────┘    └────────┬────────┘
                                │
                                │
                       ┌────────▼────────┐
                       │   MongoDB Atlas  │
                       │   (Cloud DB)     │
                       └──────────────────┘
```

---

### Estimated Costs

| Service | Platform | Tier | Monthly Cost |
|---------|----------|------|--------------|
| Backend Hosting | Render | Free | $0 |
| Frontend Hosting | Vercel | Free | $0 |
| Database | MongoDB Atlas | Free (512MB) | $0 |
| Domain (Optional) | Namecheap | - | ~$1/month |
| **Total** | | | **$0-1/month** |

**Note:** Free tiers have limitations (sleep after inactivity, limited bandwidth). For production with many users, upgrades may be needed (~$10-20/month).

---

### Scaling Plan (Future)

**When to Upgrade:**
- More than 100 active users
- Database exceeds 512MB
- Need 24/7 uptime (no sleep)
- Need faster response times

**Upgrade Path:**
- Render: $7/month (always-on service)
- MongoDB Atlas: $9/month (2GB storage)
- Vercel: Remains free (generous limits)

---

## Future Enhancements

### Planned Features
- Mobile money integration (MTN Mobile Money, Airtel Money)
- Automated email notifications for rent reminders
- PDF receipt generation
- Advanced analytics and reporting
- SMS notifications
- Property image uploads
- Maintenance request tracking

---

## Development Notes

- Built with mobile-responsive design
- Uses JWT for secure authentication
- Role-based access control (landlord/tenant)
- RESTful API architecture
- Input validation on both frontend and backend

---

## Contact

- **Developer**: Patrick Nayituriki
- **Email**: Pnayiturik@alustudent.com
- **GitHub**: https://github.com/Pnayiturik

---

**Project Status**: In Development  

Project Description...
System Architecture...
ERD diagrams...

**Last Updated**: February 2026
>>>>>>> b835adc (diagrams folder created with ERD png, System Architecture design, Class Diagram)
