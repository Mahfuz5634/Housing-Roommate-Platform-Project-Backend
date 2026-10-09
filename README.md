# 🏠 Housing & Roommate Platform Backend (B7A6 Assignment)

A production-grade, highly scalable, and secure RESTful backend API built with **Node.js, Express, TypeScript, Neon Serverless PostgreSQL, Prisma ORM, and Stripe**.

The platform provides a complete ecosystem for urban co-living, property management, roommate discovery, and rental bookings.

---

## 🌟 Key Highlights

- **👥 3 Distinct Roles with Strict RBAC**: `ADMIN`, `LANDLORD`, and `TENANT`.
- **🧩 Roommate Compatibility Matching Engine**: Calculates a 0–100% compatibility score based on budget overlap, sleep schedule, cleanliness alignment, pet friendliness, and location preferences.
- **💳 Real Stripe Payment Integration**: Generates Stripe checkout sessions for security deposits/rents with atomic database verification transactions (`prisma.$transaction`).
- **🛡️ Robust Security & Validation**: Zod request schema validation on all inputs, bcrypt password hashing, and JWT tokens (access + refresh) with GCP Social Login support.
- **⚡ High Performance Database**: PostgreSQL hosted on **Neon DB** with foreign key constraints, composite indexing on high-frequency search fields (`city`, `totalRent`, `status`), and cascading updates.
- **📚 Interactive API Documentation**: Swagger UI at `/api-docs` and a complete exportable Postman collection.

---

## 🛠️ Tech Stack & Architecture

- **Language / Runtime**: TypeScript & Node.js
- **Web Framework**: Express.js
- **Database**: PostgreSQL on Neon Serverless
- **ORM**: Prisma ORM (v5.22)
- **Validation**: Zod
- **Authentication**: JSON Web Token (JWT) + GCP OAuth (Google Auth Library)
- **Payment Gateway**: Stripe
- **Documentation**: Swagger UI Express & Postman v2.1

### 🏗️ Architecture Design Pattern
```
src/
├── app.ts                  # Express application setup & middleware stack
├── server.ts               # HTTP Server listener with graceful shutdown
├── app/
│   ├── config/             # Environment variables schema and loader
│   ├── docs/               # Swagger OpenAPI specifications
│   ├── errors/             # Custom ApiError class
│   ├── interfaces/         # Global Express type augmentations
│   ├── middlewares/        # auth, validateRequest, globalErrorHandler, notFound
│   ├── routes/             # Central route aggregator (/api/v1)
│   ├── utils/              # prisma singleton, jwtHelpers, sendResponse, catchAsync
│   └── modules/
│       ├── auth/           # Register, Login, Google Login, Refresh Token
│       ├── user/           # Profile CRUD, Admin status & role management
│       ├── roommate/       # Roommate profile & Compatibility Matching Engine
│       ├── property/       # Property listings, advanced search & filtering
│       ├── room/           # Room management & occupancy controls
│       ├── booking/        # Rental application state machine
│       ├── payment/        # Stripe checkout session, verification, transaction ledger
│       ├── maintenance/    # Maintenance ticket submission & resolution
│       ├── review/         # Property reviews and rating aggregation
│       └── admin/          # Platform-wide analytics and listing moderation
```

---

## 🔑 Demo Credentials (For Evaluation)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@roommatehub.com` | `Admin@123456` | Platform analytics, user ban/unban, property approvals |
| **LANDLORD** | `john.landlord@roommatehub.com` | `Landlord@123456` | Property listings, room CRUD, booking approval, maintenance |
| **LANDLORD (2)**| `sarah.landlord@roommatehub.com` | `Landlord@123456` | Multi-property management |
| **TENANT** | `alex.tenant@roommatehub.com` | `Tenant@123456` | Search listings, roommate matching, bookings, Stripe payments |
| **TENANT (2)** | `emma.tenant@roommatehub.com` | `Tenant@123456` | Roommate candidate with pets & flexible sleep schedule |
| **TENANT (3)** | `michael.tenant@roommatehub.com`| `Tenant@123456` | Roommate candidate |

---

## 📋 Standardized JSON API Format

### Success Response Contract
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully!",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPage": 5
  },
  "data": [ ... ]
}
```

### Error Response Contract
```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [
    {
      "path": "email",
      "message": "Invalid email address format"
    }
  ],
  "stack": null
}
```

---

## 🚀 API Endpoints Overview

### 1. Authentication (`/api/v1/auth`)
- `POST /register` - Register new user (Tenant / Landlord)
- `POST /login` - Email and password authentication (returns access & refresh tokens)
- `POST /google-login` - Google GCP OAuth ID token login
- `POST /refresh-token` - Renew access token using refresh token
- `PATCH /change-password` - Protected password update
- `GET /me` - Retrieve logged-in profile

### 2. Roommates & Compatibility Engine (`/api/v1/roommates`)
- `POST /profile` - Create / Update roommate lifestyle preferences
- `GET /profile/me` - Get logged-in tenant's roommate profile
- `GET /match` - **Algorithmic compatibility calculation against all roommate candidates**
- `GET /` - Browse and filter roommate candidates by budget, schedule, pets, smoking, location

### 3. Properties & Rooms (`/api/v1/properties`, `/api/v1/rooms`)
- `POST /properties` - Create property listing (`LANDLORD`, `ADMIN`)
- `GET /properties` - Search and filter properties (City, area, min/max rent, bedrooms, amenities)
- `GET /properties/my-listings` - Landlord's owned properties
- `GET /properties/:id` - Detailed view with rooms and reviews
- `PATCH /properties/:id` - Update listing details
- `DELETE /properties/:id` - Remove property
- `POST /rooms` - Add room to property
- `PATCH /rooms/:id` - Update room rent, capacity, or occupancy

### 4. Bookings & Applications (`/api/v1/bookings`)
- `POST /` - Submit booking request (`TENANT`)
- `GET /my-bookings` - Tenant booking history
- `GET /landlord` - Landlord review queue
- `PATCH /:id/status` - Approve / Reject booking (`LANDLORD`, `ADMIN`)
- `PATCH /:id/cancel` - Cancel pending booking (`TENANT`)

### 5. Stripe Payments (`/api/v1/payments`)
- `POST /checkout-session` - Initialize Stripe checkout session for approved booking
- `POST /verify` - Verify Stripe session & confirm booking with atomic occupancy lock
- `GET /my-payments` - Tenant receipt history
- `GET /all` - Admin platform transaction ledger

### 6. Maintenance & Reviews (`/api/v1/maintenance`, `/api/v1/reviews`)
- `POST /maintenance` - File maintenance ticket
- `GET /maintenance/my-requests` - Tenant ticket status
- `PATCH /maintenance/:id/status` - Transition status: `PENDING` ➔ `IN_PROGRESS` ➔ `RESOLVED`
- `POST /reviews` - Rate and review property
- `GET /reviews/property/:propertyId` - Property ratings & reviews

### 7. Admin Oversight (`/api/v1/admin`)
- `GET /analytics` - Real-time metrics (User counts, occupancy, bookings, total revenue)
- `PATCH /properties/:id/approve` - Approve/reject property listings

---

## 💻 Local Setup & Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Mahfuz5634/Housing-Roommate-Platform-Project-Backend.git
   cd Housing-Roommate-Platform-Project-Backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://neondb_owner:npg_Rs3aG0NmdOcy@ep-soft-truth-b57ewhsf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   JWT_ACCESS_SECRET="super-secret-access-token-key-roommate-hub-2026"
   JWT_ACCESS_EXPIRES_IN="1d"
   JWT_REFRESH_SECRET="super-secret-refresh-token-key-roommate-hub-2026"
   JWT_REFRESH_EXPIRES_IN="30d"
   BCRYPT_SALT_ROUNDS=12
   STRIPE_SECRET_KEY="sk_test_..."
   CLIENT_URL="http://localhost:3000"
   ```

4. **Synchronize Database & Seed Demo Data**:
   ```bash
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Run Automated Test Suite**:
   ```bash
   npx ts-node scripts/test-api.ts
   ```

7. **Explore Swagger UI**:
   Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser.

---

## 📦 Deployment to Vercel

The project includes `vercel.json` and `api/index.ts` pre-configured for Vercel Serverless Functions:
```bash
npm run build
vercel --prod
```

---

## 🎥 Video Walkthrough Outline (5–10 Minutes)

1. **Project Overview & Architecture (1–2 mins)**:
   - Introduce project: Housing & Roommate Platform.
   - Explain layered architecture: `Routes` ➔ `Controllers` ➔ `Services` ➔ `Prisma` ➔ `Neon PostgreSQL`.
2. **Demonstrate All 3 Roles (2–3 mins)**:
   - Log in as **Admin** (`admin@roommatehub.com`), retrieve platform analytics.
   - Log in as **Landlord** (`john.landlord@roommatehub.com`), create property and room.
   - Log in as **Tenant** (`alex.tenant@roommatehub.com`), run roommate matching engine.
   - Demonstrate **RBAC 403 Forbidden**: Tenant attempting to access `/api/v1/admin/analytics`.
3. **Demonstrate CRUD Operations (1–2 mins)**:
   - Create, retrieve, update, and search properties with query parameters (`city`, `rent`).
4. **Validation & Structured Error Handling (1 min)**:
   - Trigger a 400 Bad Request by providing invalid email or missing fields in body.
   - Show 404 Not Found response.
5. **Demonstrate Stripe Payment Flow (1–2 mins)**:
   - Booking creation ➔ Landlord approval ➔ Stripe checkout session creation ➔ Verification transaction locking room occupancy.
6. **Technical Challenge Solved (1 min)**:
   - Explain the multi-factor Roommate Compatibility Algorithm and the atomic Prisma transaction (`prisma.$transaction`) ensuring double-booking prevention.

---

## 📄 License
MIT License. Developed for the B7A6 Backend Assignment.
