# BookYourService Backend

Production-ready Node.js backend for BookYourService platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:8080`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── index.ts           # Entry point
│   ├── config/
│   │   ├── database.ts    # Prisma client
│   │   └── jwt.ts         # JWT configuration
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── errorHandler.ts
│   │   ├── healthCheck.ts
│   │   └── notFoundHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── problem.routes.ts
│   │   └── category.routes.ts
│   └── services/
│       ├── auth.service.ts
│       ├── booking.service.ts
│       ├── user.service.ts
│       └── admin.service.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/login` | Login with OTP |
| POST | `/api/auth/register` | Register with password |
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get bookings (filtered) |
| GET | `/api/bookings/:id` | Get single booking |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/bookings/:id/rate` | Rate booking |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/change-password` | Change password |
| GET | `/api/users/wallet` | Get wallet info |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/bookings` | All bookings |
| POST | `/api/admin/providers/:id/review` | Approve/reject provider |
| GET | `/api/admin/audit-logs` | Audit logs |
| GET | `/api/admin/analytics` | Platform analytics |

## 🗄️ Database Schema

### Core Models
- **User** - Customers, providers, admins
- **Booking** - Service bookings
- **Problem** - Service catalog items
- **Category** - Service categories
- **Payment** - Payment records
- **WalletLedger** - Transaction history
- **AuditLog** - Activity tracking

### Enums
- `UserRole`: USER, PROVIDER, ADMIN
- `UserStatus`: ACTIVE, SUSPENDED, PROBATION, etc.
- `BookingStatus`: CREATED, ASSIGNED, ACCEPTED, COMPLETED, etc.
- `SLATier`: GOLD, SILVER, BRONZE

## 🐳 Docker Deployment

```bash
# Build image
docker build -t bookyourservice-backend .

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  bookyourservice-backend
```

## ☁️ Cloud Run Deployment

### 1. Build and push to Container Registry
```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/bookyourservice-api

# Or using Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy bookyourservice-api \
  --image gcr.io/PROJECT_ID/bookyourservice-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://...",JWT_SECRET="..."
```

### 3. Configure Cloud SQL
```bash
# Create connection
gcloud sql connections connect bookyourservice-db \
  --instance=bookyourservice-db \
  --user=postgres

# Or use Cloud SQL Auth proxy
./cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 8080 |
| `DATABASE_URL` | PostgreSQL connection | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiry | 15m |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh expiry | 7d |
| `CORS_ORIGIN` | CORS origin | * |

## 🧪 Demo Credentials

| Role | Phone | OTP/Password |
|------|-------|--------------|
| Admin | 9999999999 | admin123 |
| Customer | Any | 1234 |
| Provider | Any | 1234 |

## 📈 Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control
- ✅ Auto-provider matching
- ✅ SLA-based booking deadlines
- ✅ Wallet management
- ✅ Audit logging
- ✅ Cloud Run ready
- ✅ Docker multi-stage builds

## 🛠️ Development

```bash
# Run with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Run tests
npm test
```

## 📝 License

MIT

