# Azan e Madinah - Travel Booking Management System

A comprehensive travel agency management system with separate portals for agents and internal staff, featuring flight bookings, group ticketing, payment management, and role-based access control.

## 🏗️ System Architecture

```
azan-e-madinah/
├── backend/          # Node.js/Express API Server
├── frontend/         # Agent Portal (React + Vite)
└── admin/           # Admin Panel (React + TypeScript + Vite)
```

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: v6.0 or higher
- **npm** or **yarn**
- **Cloudinary Account** (for image uploads)
- **Gmail Account** (for email notifications)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd azan-e-madinah
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=production

# Database
MONGO_URI=mongodb://127.0.0.1:27017/azan_e_madinah

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Portal URLs (for email links)
AGENT_PORTAL_URL=http://localhost:5173
ADMIN_PANEL_URL=http://localhost:5174
```

**Initialize System:**

```bash
node utils/initializeSystem.js
```

This will:
- Seed all roles and permissions
- Create default Super Admin account
  - Email: `hassamsaleem55@gmail.com`
  - Password: `Admin@123`

**Start Backend:**

```bash
npm start
```

Backend runs on: `http://localhost:8000`

### 3. Frontend (Agent Portal) Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

**Start Agent Portal:**

```bash
npm run dev
```

Agent Portal runs on: `http://localhost:5173`

### 4. Admin Panel Setup

```bash
cd admin
npm install
```

Create `.env` file in admin directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Start Admin Panel:**

```bash
npm run dev
```

Admin Panel runs on: `http://localhost:5174`

## 🔧 Production Deployment

### Backend Production Setup

1. **Update Environment Variables:**

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/azan_e_madinah
AGENT_PORTAL_URL=https://agents.yourdomain.com
ADMIN_PANEL_URL=https://admin.yourdomain.com
```

2. **Build & Start:**

```bash
cd backend
npm start
```

3. **Use Process Manager (PM2):**

```bash
npm install -g pm2
pm2 start server.js --name azan-e-madinah-backend
pm2 save
pm2 startup
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

Serve the `dist` folder using Nginx, Apache, or deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront

### Admin Panel Production Build

```bash
cd admin
npm run build
```

Serve the `dist` folder similarly to frontend.

## 🔐 Security Configuration

### 1. Gmail App Password Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate App Password for "Mail"
4. Use this password in `EMAIL_PASSWORD` env variable

### 2. Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get credentials from Dashboard
3. Add to backend `.env` file

### 3. Google OAuth Setup (Optional)

1. Go to: https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized origins:
   - Agent Portal: `http://localhost:5173` (dev) or your domain
   - Admin Panel: `http://localhost:5174` (dev) or your domain
4. Add redirect URIs
5. Copy Client ID to frontend `.env` files

## 📚 System Features

### Agent Portal
- ✅ Self-registration with agency details
- ✅ Flight booking management
- ✅ Group ticketing
- ✅ Payment tracking
- ✅ Profile management
- ✅ Two-factor authentication (OTP via email)

### Admin Panel
- ✅ User & agency management
- ✅ Role-based access control (RBAC)
- ✅ Booking approvals & management
- ✅ Payment voucher management
- ✅ Financial ledger & reports
- ✅ Airlines, banks, sectors configuration
- ✅ Email notifications for all events
- ✅ Two-factor authentication (OTP via email)

## 👥 Default Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Full system access | All permissions |
| **Admin** | Administrative access | All except role management |
| **Operations Manager** | Booking & payment approvals | Manage bookings, payments, approvals |
| **Booking Manager** | Booking operations | Create/edit bookings & groups |
| **Finance Manager** | Financial management | Ledger, payments, reports |
| **Support Staff** | View-only access | View bookings, agencies, ledger |
| **Data Manager** | Master data management | Manage airlines, banks, sectors |
| **Agent** | Travel agent access | Limited to own bookings & payments |

## 🔑 Identity Separation System

This system maintains **separate identities** for the same user:

- **Agent Identity**: Only accessible via Agent Portal (requires `agencyCode`)
- **Internal Staff Identity**: Only accessible via Admin Panel (assigned roles)

### Key Points:
- One email = One user account
- User can have BOTH Agent role AND Internal Staff roles
- Login requires portal context (`loginFrom` parameter)
- Separate OTP fields per portal (`agentOTP` / `adminOTP`)
- Agent role CANNOT be assigned from Admin Panel

### ⚠️ Important: Dual Identity & Password

When a user gains a **second identity** (e.g., Super Admin registers as Agent):
- ✅ **Password is preserved** - The user keeps their existing password
- ✅ **Roles are updated only** - No credential changes whatsoever
- ✅ **Single login** - Same credentials work for both portals
- ✅ **Seamless access** - Login to Agent Portal OR Admin Panel with same password
- 📧 Notification only (no new credentials sent)

When a user adds **more roles** within same identity:
- ✅ **Password unchanged** - Existing credentials remain valid
- ✅ **Roles added only** - No password reset or credential changes
- ✅ **Permissions updated** - New role permissions become active immediately

**Password is ONLY generated for:**
- 🆕 **Brand new users** - First time registration
- 🔄 **Password reset** - When user explicitly requests password reset

**Example Scenarios:**

1. **Super Admin adds Agent identity:**
   - Email: `admin@example.com`
   - Had: Super Admin role with password `Admin@123`
   - Registers as Agent through Agent Portal
   - Result: Agent role added, password stays `Admin@123`
   - Access: Both portals with same password
   - Notification: Email sent about Agent Portal access (no new password)
   - Note: Agent status set to "Inactive" - requires admin approval

2. **Agent gets promoted to Internal Staff:**
   - Email: `agent@example.com`  
   - Had: Agent role with password `AgentPass123` (received via email at registration)
   - Admin assigns Operations Manager role from Admin Panel
   - Result: Operations Manager role added, password stays `AgentPass123`
   - Access: Both portals with same password
   - Notification: Email sent informing about Admin Panel access (no new password)

3. **New user creation:**
   - Email: `newuser@example.com`
   - Doesn't exist in system
   - Result: Auto-generated password sent via email
   - Must change password on first login

## 🧪 Testing the Setup

### 1. Test Backend

```bash
curl http://localhost:8000/
```

Should return: "AZAN-E-MADINA Travel API is running"

### 2. Test Database Connection

Check backend logs for: "✅ MongoDB Connected Successfully"

### 3. Test Email Service

Login to admin panel and trigger password reset to test email delivery.

### 4. Login to Admin Panel

- URL: `http://localhost:5174`
- Email: `hussali817817@gmail.com`
- Password: `Admin@123`
- You'll receive OTP via email

### 5. Test Agent Registration

- URL: `http://localhost:5173`
- Click "Sign Up"
- Register as new agency
- Check pending status in admin panel

## 🗄️ Database Collections

- `registers` - User accounts (agents & staff)
- `roles` - System roles
- `permissions` - Permission definitions
- `bookings` - Flight bookings
- `groupticketing` - Group ticket requests
- `payments` - Payment vouchers
- `airlines` - Airline master data
- `banks` - Bank accounts
- `sectors` - Flight sectors/routes

## 📧 Email Templates

The system sends branded emails for:

- **Agent Portal Emails** (gold & navy theme):
  - Registration credentials
  - OTP for login
  - Password reset
  - Status changes

- **Admin Panel Emails** (professional theme):
  - User credentials
  - OTP for login
  - Password reset
  - Booking confirmations

## 🛠️ Maintenance

### Reset Super Admin Password

```bash
cd backend
node
```

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://127.0.0.1:27017/azan_e_madinah');
const Register = mongoose.model('Register', require('./models/Register').schema);
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('NewPassword@123', salt);
await Register.updateOne(
  { email: 'hassamsaleem55@gmail.com' },
  { password: hashedPassword, plainPassword: 'NewPassword@123' }
);
process.exit();
```

### Backup Database

```bash
mongodump --db azan_e_madinah --out ./backup
```

### Restore Database

```bash
mongorestore --db azan_e_madinah ./backup/azan_e_madinah
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh`
- Verify `.env` file exists and has correct values
- Check port 8000 is not in use

### Emails not sending
- Verify Gmail App Password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Ensure 2FA is enabled on Gmail account

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` matches backend URL
- Check CORS settings in backend
- Restart frontend after `.env` changes

### OTP not working
- Ensure `loginFrom` parameter is sent from frontend
- Check backend logs for OTP generation
- Verify email delivery

### Image uploads failing
- Verify Cloudinary credentials
- Check file size limits
- Ensure Cloudinary API is accessible

## 📞 Support

For issues or questions, contact: hassamsaleem55@gmail.com

## 📄 License

Proprietary - All rights reserved

---

**Built with:** Node.js, Express, MongoDB, React, TypeScript, Tailwind CSS

**Version:** 1.0.0  
**Last Updated:** February 5, 2026
