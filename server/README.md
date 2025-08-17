# StarkPay Backend Server

A Node.js/Express backend server for the StarkPay application, migrated from Next.js API routes to use PostgreSQL as the database.

## Features

- **Express.js** server with TypeScript support
- **PostgreSQL** database with connection pooling
- **JWT** authentication for admin routes
- **Rate limiting** and security middleware
- **CORS** support for frontend integration
- **Comprehensive API endpoints** for all StarkPay services

## API Endpoints

### Admin Routes (`/api/admin`)
- `POST /login` - Admin authentication
- `GET /transactions` - Get transactions with pagination
- `GET /pending-transactions` - Get pending transactions
- `GET /search-txn` - Search transactions by reference or wallet address

### Airtime Routes (`/api/airtime`)
- `POST /buy` - Purchase airtime

### Data Routes (`/api/data`)
- `POST /buy` - Purchase data
- `GET /plans` - Get data plans

### Cable Routes (`/api/cable`)
- `GET /plans` - Get cable TV plans
- `POST /pay` - Pay cable TV bills

### Utility Routes (`/api/utility`)
- `GET /plans` - Get utility plans
- `POST /pay` - Pay utility bills

### Transaction Routes (`/api/transactions`)
- `POST /store` - Store transaction
- `GET /` - Get transactions

### Refund Routes (`/api/refunds`)
- `POST /` - Create refund
- `GET /` - Get all refunds
- `PUT /:id/process` - Process refund

### Pending Transaction Routes (`/api/pending-transactions`)
- `POST /store` - Store pending transaction
- `PUT /:id/update` - Update pending transaction
- `GET /` - Get pending transactions

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=starkpay
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # External APIs
   NEXT_PUBLIC_BASE_URL=https://api.example.com
   NEXT_USER_ID=your_user_id
   NEXT_PRIVATE_KEY=your_private_key
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb starkpay
   
   # The server will automatically create tables on first run
   ```

5. **Build and Run**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## Database Schema

The server automatically creates the following tables:

- **admin_users** - Admin user accounts
- **transactions** - Completed transactions
- **pending_transactions** - Pending/processing transactions
- **refunds** - Refund records

## Development

- **Watch mode**: `npm run watch` - Compiles TypeScript on file changes
- **Development server**: `npm run dev` - Runs with ts-node for development
- **Production build**: `npm run build` - Compiles TypeScript to JavaScript

## API Documentation

All endpoints return JSON responses with consistent error handling:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "error": "Error description",
  "message": "Additional error details"
}
```

## Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration for frontend security
- **JWT** token validation
- **Input validation** on all endpoints
- **SQL injection protection** with parameterized queries

## Migration from Next.js

This server replaces the following Next.js API routes:
- `/api/admin/*` → `/api/admin/*`
- `/api/buy-airtime` → `/api/airtime/buy`
- `/api/buy-data` → `/api/data/buy`
- `/api/get-data-plans` → `/api/data/plans`
- `/api/get-cable-plans` → `/api/cable/plans`
- `/api/pay-cable` → `/api/cable/pay`
- `/api/get-utility-plans` → `/api/utility/plans`
- `/api/pay-utility` → `/api/utility/pay`
- `/api/store-transaction` → `/api/transactions/store`
- `/api/store-pending-transaction` → `/api/pending-transactions/store`
- `/api/update-pending-transaction` → `/api/pending-transactions/:id/update`
- `/api/refund` → `/api/refunds/*`

## Health Check

The server includes a health check endpoint at `/health` for monitoring and load balancer health checks.
