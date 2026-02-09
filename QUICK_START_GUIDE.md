# Quick Start Guide - Azan-e-Madinah Implementation

## 🚀 What's Been Implemented

### ✅ Backend (Ready to Use)
All backend APIs are functional and ready for testing/integration:

**Base URL:** `http://localhost:5000/api`

#### Available Endpoints:

**Packages:**
- `GET /packages` - List all packages (with filters)
- `GET /packages/:id` - Get package details
- `POST /packages` - Create package (Protected)
- `PUT /packages/:id` - Update package (Protected)
- `DELETE /packages/:id` - Delete package (Protected)

**Hotels:**
- `GET /hotels` - List all hotels
- `GET /hotels/:id` - Get hotel details
- `POST /hotels` - Create hotel (Protected)
- `PUT /hotels/:id` - Update hotel (Protected)
- `DELETE /hotels/:id` - Delete hotel (Protected)

**Visas:**
- `GET /visas` - List all visas
- `GET /visas/:id` - Get visa details
- `GET /visas/popular` - Get popular visas
- `POST /visas` - Create visa (Protected)
- `PUT /visas/:id` - Update visa (Protected)
- `DELETE /visas/:id` - Delete visa (Protected)

**Tours:**
- `GET /tours` - List all tours
- `GET /tours/:id` - Get tour details
- `GET /tours/featured` - Get featured tours
- `POST /tours` - Create tour (Protected)
- `PUT /tours/:id` - Update tour (Protected)
- `DELETE /tours/:id` - Delete tour (Protected)

**Testimonials:**
- `GET /testimonials` - List testimonials (Admin)
- `GET /testimonials/public` - Public approved testimonials
- `POST /testimonials` - Submit testimonial
- `PUT /testimonials/:id/approve` - Approve (Protected)
- `PUT /testimonials/:id/reject` - Reject (Protected)
- `PUT /testimonials/:id/response` - Add response (Protected)

**Content:**
- `GET /content/page/:pageKey` - Get page content
- `POST /content` - Create content (Protected)
- `PUT /content/:id` - Update content (Protected)
- `PUT /content/:id/publish` - Publish content (Protected)

### ✅ Admin Panel (Accessible)

Navigate to admin panel pages:

1. **Packages:** `/packages` - Manage Umrah/Hajj packages
2. **Hotels:** `/hotels` - Manage hotel inventory
3. **Visas:** `/visas` - Manage visa services
4. **Tours:** `/tours` - Manage tour packages
5. **Testimonials:** `/testimonials` - Review & approve testimonials
6. **Content:** `/content-management` - Manage website content

**Features Available:**
- Filter and search functionality
- View all records in table format
- Delete records with confirmation
- View/Edit/Delete action buttons
- Status indicators
- Responsive design

**Not Yet Available:**
- Create/Edit forms (forms not built yet)
- Image upload
- Advanced editing

### ✅ Frontend (Public Pages)

Navigate to public pages:

1. **Umrah Packages:** `/packages` or `/umrah-packages`
2. **Visa Services:** `/visa-services`
3. **Tour Packages:** `/tour-packages` or `/tours`
4. **About Us:** `/about-us`

**Features Available:**
- Hero sections with search
- Filter sidebars
- Responsive cards/listings
- Modal popups (visa details)
- Call-to-action buttons
- Mobile-friendly design

**Not Yet Available:**
- Detail pages (clicking "View Details" will 404)
- Booking forms
- Contact page
- Testimonial submission

---

## 📝 How to Test

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
Backend runs on: `http://localhost:5000`

### 2. Start Admin Panel
```bash
cd admin
npm install
npm run dev
```
Admin runs on: `http://localhost:5173` (or similar)

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5174` (or similar)

### 4. Test API with Sample Data

You can test the APIs using Postman or curl:

**Create a Package:**
```bash
POST /api/packages
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "7 Days Umrah Package",
  "packageType": "Umrah",
  "city": "Makkah & Madinah",
  "duration": {
    "days": 7,
    "nights": 6
  },
  "pricingTiers": {
    "sharing": 150000,
    "quad": 175000,
    "triple": 200000,
    "double": 250000
  },
  "description": "Affordable Umrah package with quality hotels",
  "status": "Active"
}
```

**Get All Packages:**
```bash
GET /api/packages
```

**Filter Packages:**
```bash
GET /api/packages?packageType=Umrah&status=Active&city=Makkah
```

---

## 🔧 Next Steps for Development

### Priority 1: Admin CRUD Forms
Create form components to enable creating/editing records:

**Files to Create:**
- `admin/src/pages/PackageForm.tsx`
- `admin/src/pages/HotelForm.tsx`
- `admin/src/pages/VisaForm.tsx`
- `admin/src/pages/TourForm.tsx`

### Priority 2: Frontend Detail Pages
Create detail pages for viewing full information:

**Files to Create:**
- `frontend/src/pages/Frontend/PackageDetail/index.jsx`
- `frontend/src/pages/Frontend/TourDetail/index.jsx`
- `frontend/src/pages/Frontend/HotelDetail/index.jsx`
- `frontend/src/pages/Frontend/VisaApplication/index.jsx`

### Priority 3: Image Upload Integration
Connect Cloudinary for file uploads:

**Files to Modify:**
- Admin forms (add image upload fields)
- `backend/config/cloudinary.js` (already exists)
- Create upload middleware

### Priority 4: RBAC Extension
Add permissions for new modules:

**Files to Modify:**
- `backend/utils/seedRolesPermissions.js`
- Add permissions: `packages.*`, `hotels.*`, `visas.*`, `tours.*`, etc.

---

## 🎨 Brand Guidelines

**Colors:**
- Primary: `#6B1B3D` (Maroon)
- Accent: `#C9A536`, `#E6C35C` (Gold)
- Dark: `#0B0E1A` (Navy/Black)

**Typography:**
- Use existing font families
- Maintain consistent heading sizes

**Components:**
- Use existing Tailwind CSS classes
- Follow responsive design patterns
- Maintain consistent button styles

---

## 🗂️ File Structure Reference

```
backend/
├── models/           (7 new models)
├── services/         (6 new services)
├── controllers/      (6 new controllers)
├── routes/           (6 new routes)
└── server.js         (updated with new routes)

admin/src/pages/
├── Packages.tsx       ✅
├── Hotels.tsx         ✅
├── Visas.tsx          ✅
├── Tours.tsx          ✅
├── Testimonials.tsx   ✅
└── ContentManagement.tsx ✅

frontend/src/
├── api/              (5 new API services)
└── pages/Frontend/
    ├── UmrahPackages/  ✅
    ├── VisaServices/   ✅
    ├── TourPackages/   ✅
    └── AboutUs/        ✅
```

---

## 📚 Documentation References

- **Functional Requirements:** `FUNCTIONAL_REQUIREMENTS.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Todo List:** Available in VS Code sidebar

---

## ⚡ Common Commands

**Backend:**
```bash
npm run dev          # Development with nodemon
npm start            # Production
npm run seed-roles   # Seed permissions
```

**Admin/Frontend:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
```

---

## 🐛 Troubleshooting

**Issue:** API returns 401 Unauthorized
- **Solution:** Login to get JWT token, add to Authorization header

**Issue:** CORS errors
- **Solution:** Check backend CORS configuration in `server.js`

**Issue:** Images not uploading
- **Solution:** Image upload not yet connected to Cloudinary (pending implementation)

**Issue:** "View Details" gives 404
- **Solution:** Detail pages not yet created (pending implementation)

---

## 📞 Need Help?

Refer to:
1. Implementation Status document
2. Functional Requirements document
3. Code comments in created files
4. Existing pattern in similar components
