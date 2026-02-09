# Functional Requirements Analysis
## Extracted from UI Reference Images

---

## 1. Core Functional Modules

### 1.1 Authentication & User Management
- **Multi-portal system**: Admin Portal, Agent Portal, Customer Portal
- **Authentication flows**:
  - Email/Password login with OTP verification
  - Google OAuth integration
  - Forgot password with portal-specific resets
  - Agency code for agent login
- **User roles**: Super Admin, Admin, Agent, Customer
- **Profile management**: Dashboard access, booking history, ledger

### 1.2 Umrah/Hajj Package System
- **Package attributes**:
  - Departure cities (Lahore, Mumbai, Peshawar, etc.)
  - Duration (days/nights)
  - Pricing tiers: Sharing, Quad, Triple, Double
  - Accommodation details (Makkah & Madinah hotels with ratings & distances)
  - Visa inclusion, Transport, Ziyarat with Guide
  - Package status (20 Days, 30 Days, etc.)
- **Booking flow**:
  - Package selection
  - Passenger details (Adults + Children)
  - Passport information capture
  - Room type selection
  - Payment processing
- **Filters**: By city, by price, by duration

### 1.3 Flight Booking System
- **Search capabilities**:
  - Sector-based filtering (LHE-JED-LHE, etc.)
  - Multiple airlines (Serene Air, Pakistan International, Saudia)
  - Date-based availability
  - Pricing display (Sharing, Child, Triple, Double)
  - Remaining seats indicator
- **Flight details**:
  - Flight numbers, timings
  - Arrival/departure airports
  - Transit information
  - Map integration for routes

### 1.4 Hotel Booking System
- **Hotel listings**:
  - Location (Makkah, Madinah)
  - Star ratings (2-5 stars)
  - Distance from Haram
  - Pricing per night (Sharing, Quad, Triple, Double)
  - Hotel images gallery
  - Amenities and services
- **Booking request form**:
  - Check-in/check-out dates
  - Number of guests
  - Special requests
  - Contact information

### 1.5 Visa Services Module
- **Supported countries** (40+ countries identified):
  - UK, USA, Canada, Australia, New Zealand
  - UAE (10/30/60 days), Saudi Arabia
  - Europe: France, Germany, Spain, Netherlands, Denmark, Belgium
  - Asia: Turkey, Japan, South Korea, China, Hong Kong, Singapore, Thailand
  - Middle East: Oman, Bahrain, Qatar, Kuwait
  - Others: Egypt, Kenya, Uganda, Tanzania, Rwanda, North Cyprus
- **Visa types**:
  - Tourist Visa
  - Business Visa
  - Student Visa
  - Family Visit
  - Transit Visa
  - Work Visa
- **Visa details per country**:
  - Processing time
  - Price (Adult, Child)
  - Required documents by category (Business Owner, Job Holder, Student, Retired Person, Dependent)
  - Entry type (Single/Multiple)
- **Application form**: Full name, email, phone, WhatsApp, nationality, travel date, adults/children count, additional messages

### 1.6 Tour Packages
- **Tour types**:
  - Summer Special
  - Winter Special
  - Honeymoon Special
  - Budget Tours
  - Luxury Tours
- **Destinations**:
  - Europe (9 days): France, Spain
  - UK (9 days)
  - USA (9 days)
  - Baku & Azerbaijan (5 days, 4 nights)
  - Dubai & Baku Combined
- **Tour details**:
  - Day-wise itinerary
  - Included services (Return tickets, Baku visa, hotel, drop)
  - Pricing per person
  - Star ratings and reviews
  - Group tour indicator

### 1.7 Group Ticketing
- **Bulk booking capabilities**
- **Group discounts**
- **Coordination features**

### 1.8 Hajj/Umrah Calculator
- **Date-based cost calculator**
- **Package customization**

---

## 2. Content & Information Modules

### 2.1 About Us / Company Info
- **Established year**: 2011
- **Mission & Vision statements**
- **Core Values**:
  - Spiritual Respect
  - Radical Honesty
  - Unmatched Quality
  - Personalized Care
- **Company network**:
  - Unique Air Ticket Pvt Ltd (Ticketing in Qatar, Food)
  - Marhaba Travels & Tours Pvt Ltd (Umrah, Hajj & Religious Tourism)
  - Marhaba Traders (Wholesale Cargo & Retail Trade)
  - Marhaba Cattle & Agri Farm (Livestock, Dairy & Organic Farming)

### 2.2 How It Works
- **Step 1**: Consult - Contact team with goals
- **Step 2**: Discover - Expert advice on visa and applications
- **Step 3**: Confirm - Handle tickets and bookings
- **Step 4**: Depart - Travel safely with support

### 2.3 Our Expertise
- **Premium Stay** (Holy Hotels near Haram)
- **Elite Flights** (Hassle-free with airlines)
- **Concierge** (Child support, meet-and-assist)
- **Spiritual Care** (Guided tour, spiritual guide)
- **Ziyarat** (Guided tours through Islamic history)

### 2.4 Statistics Dashboard
- **3,500+ Projects** (Umrah Performed)
- **12+ Years** of Experience
- **50+ Routes** (Flight Coverage)
- **24/7 Support**

### 2.5 Top Destinations
- **Countries served**: 150+, 20+, etc.
- **Featured destinations with images**

### 2.6 Pilgrim's Handbook
- **Ihram Guide**
- **Tawaf Instructions**
- **Sa'i Guide**
- **Hajj Rituals**
- **Download PDF guides**

---

## 3. Customer-Facing Features

### 3.1 Testimonials / Reviews
- **Customer name & rating**
- **Review text**
- **Browse all testimonials**

### 3.2 Contact System
- **Multiple contact methods**:
  - Phone: Multiple numbers
  - Email
  - Physical addresses (Lahore, Khairpur)
- **Contact form**:
  - Full name, email, phone, subject, message
- **Live chat/WhatsApp integration**

### 3.3 Latest Offers Section
- **Promotional packages carousel**
- **Special deals highlighting**

### 3.4 Hero Section
- **Tagline**: "Your Sacred Journey Starts Here"
- **Subtitle**: "Trusted Umrah, Hajj, Hajj & Visa Services with Exclusive Packages!"
- **CTA**: "Explore Umrah Packages"
- **Quick access icons**: Umrah, Hajj, Visa, Hotel, Flight, Ticketing, Meet & Assist

---

## 4. Dashboard & Agent Features

### 4.1 Agent Dashboard
- **Booking management**
- **Ledger/Account statements**
- **Payment vouchers**
- **Commission tracking**

### 4.2 Payment System
- **Payment voucher creation**
- **Payment history**
- **Invoice generation**

---

## 5. Admin Panel Requirements

### 5.1 User Management
- **Registered agencies CRUD**
- **Agent details & approval**
- **User roles & permissions management**

### 5.2 Booking Management
- **All bookings overview**
- **Booking status updates**
- **Payment tracking**

### 5.3 Inventory Management
- **Airlines CRUD**
- **Sectors CRUD**
- **Hotels CRUD**
- **Packages CRUD**
- **Tour packages CRUD**

### 5.4 Financial Management
- **Bank accounts**
- **Payment vouchers**
- **Ledger reports**
- **Export functionality**

### 5.5 Content Management
- **Testimonials approval**
- **About us content**
- **Statistics updates**
- **Offers/promotions**

### 5.6 Visa Management
- **Countries & pricing**
- **Document requirements**
- **Application review**

---

## 6. Data Entities & Relationships

### Core Entities:
1. **User** (Admin, Agent, Customer)
2. **Package** (Umrah/Hajj)
3. **Hotel** (with location, pricing, amenities)
4. **Flight** (sectors, airlines, schedules)
5. **Booking** (packages, flights, hotels)
6. **Visa** (country, type, pricing, documents)
7. **Tour** (itinerary, pricing, inclusions)
8. **Payment** (vouchers, transactions)
9. **Testimonial** (customer reviews)
10. **Airline**, **Sector**, **Bank**

### Relationships:
- User → Bookings (1:N)
- Package → Hotels (N:N for Makkah & Madinah)
- Booking → Passengers (1:N)
- Booking → Payments (1:N)
- Visa → Country (N:1)
- Tour → Itinerary (1:N)

---

## 7. Non-Functional Requirements

### Security:
- Role-based access control
- Portal-specific authentication
- OTP verification
- Secure payment handling

### Performance:
- Fast search/filtering
- Image optimization
- Lazy loading for large lists

### UX/UI:
- Mobile-responsive design
- Intuitive navigation
- Loading states & error handling
- Form validation with clear feedback
- Accessibility compliance

### Scalability:
- Modular architecture
- Clean separation of concerns
- Efficient database queries with indexes
- API versioning

---

## 8. Brand Identity (Must Preserve)

### Color Scheme:
- Primary: Maroon/Burgundy (#6B1B3D, #7D1E47)
- Accent: Orange/Gold (#FF8C00, #C9A536, #E6C35C)
- Dark: Navy/Black (#0B0E1A, #1a1f35)
- Neutral: White, Gray tones

### Typography:
- Clean, professional fonts
- Clear hierarchy

### Design Principles:
- Islamic/spiritual aesthetics
- Trust and professionalism
- Clear call-to-actions
- Generous whitespace

---

## Implementation Priority Order:
1. **Backend schema & API refactor** (Foundation)
2. **Admin panel** (Content & inventory management)
3. **Agent portal** (Booking & dashboard)
4. **Customer portal** (Package browsing & booking)
5. **Content pages** (About, Contact, etc.)
