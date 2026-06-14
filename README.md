# FactoryOS AI — Enterprise Manufacturing ERP

A production-ready, AI-powered, multi-tenant Manufacturing ERP platform built for small and medium manufacturing businesses.

## 🚀 Features

- **AI Co-Pilot** — Natural language chat for business insights, inventory forecasting, and supplier recommendations
- **Multi-Tenant Architecture** — Isolated data per company with `companyId` enforced on every query
- **Role-Based Access Control** — Owner, Admin, Manager, Accountant, Production, Warehouse, Sales, Viewer roles
- **Dashboard** — Live financial metrics, machine telemetry, production queue, AI recommendations
- **Inventory Management** — Warehouse stock levels, batch tracking, barcode visualization, low-stock alerts
- **Production & BOM** — Bill of Materials builder, production order execution with material validation
- **Finance & GST** — Invoicing, expense tracking, payments, interactive GST calculator
- **Machine Monitoring** — Maintenance scheduling, running hours, AI predictive alerts
- **Employee Management** — Attendance tracking, payroll, department management
- **Reports** — Financial, production, and inventory analytics with AI summaries and CSV/PDF export

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 App Router, TypeScript, Tailwind CSS v4 |
| Auth | Custom JWT (jose) + bcryptjs, HTTPOnly cookies |
| Database | SQLite (dev) → PostgreSQL (prod), Prisma ORM |
| Charts | Recharts |
| Animations | Framer Motion |
| AI | OpenAI API (with intelligent fallback mock) |

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run database migrations and generate Prisma client
npx prisma migrate dev --name init

# Seed with demo data (company, users, products, inventory, machines)
node prisma/seed.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@factoryos.com | password123 |
| Production | production@factoryos.com | password123 |
| Warehouse | warehouse@factoryos.com | password123 |
| Accountant | finance@factoryos.com | password123 |

## 🔐 Security

- Passwords hashed with bcryptjs (10 salt rounds)
- Sessions stored as signed JWTs in HTTPOnly cookies
- All API routes validate session and enforce `companyId` tenant isolation
- Role-based authorization on sensitive operations
- Audit logs for all write operations

## 🤖 AI Configuration (Optional)

Add your OpenAI API key to enable live AI responses:

```bash
# .env.local
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-32-char-secret-here
```

Without a key, the system uses an intelligent built-in manufacturing knowledge base.

## 🗄 Database

SQLite is used for local development. To switch to PostgreSQL for production:

1. Update `prisma/schema.prisma`:
   ```
   provider = "postgresql"
   url      = env("DATABASE_URL")
   ```
2. Set `DATABASE_URL` in your environment
3. Run `npx prisma migrate dev`

## 📁 Project Structure

```
src/
├── app/
│   ├── api/v1/          # REST API routes (auth, dashboard, inventory, production, finance, machines, ai)
│   ├── app/             # Protected app pages (layout + all module pages)
│   ├── login/           # Authentication pages
│   └── register/
├── components/
│   ├── sidebar.tsx      # Navigation sidebar
│   ├── header.tsx       # Top header with notifications
│   ├── ai-assistant.tsx # Floating AI Co-Pilot panel
│   └── theme-context.tsx
├── lib/
│   ├── auth.ts          # JWT session management
│   └── db.ts            # Prisma client singleton
└── middleware.ts        # Route protection
```
