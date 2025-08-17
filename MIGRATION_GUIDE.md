# Migration Guide: Next.js API Routes to Node.js Backend

This guide helps you migrate from Next.js API routes to the new Node.js backend server with PostgreSQL.

## What Changed

### Before (Next.js API Routes)
- API routes in `src/app/api/`
- Supabase as database
- Serverless functions
- Built-in Next.js routing

### After (Node.js Backend)
- Express.js server in `server/` folder
- PostgreSQL database
- Standalone Node.js server
- RESTful API endpoints

## Migration Steps

### 1. Set Up PostgreSQL Database

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb starkpay

# Create user (optional)
createuser -P starkpay_user
```

### 2. Configure Environment Variables

```bash
cd server
cp env.example .env
```

Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=starkpay
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 3. Install Dependencies and Setup

```bash
cd server
npm install
npm run setup  # Creates database tables and admin user
```

### 4. Update Frontend API Calls

#### Before (Next.js)
```typescript
// API calls to Next.js routes
const response = await fetch('/api/buy-airtime', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

#### After (Node.js Backend)
```typescript
// Update API base URL in your frontend
const API_BASE = 'http://localhost:3001/api';

// API calls to Node.js backend
const response = await fetch(`${API_BASE}/airtime/buy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 5. Update Environment Variables in Frontend

```env
# .env.local (frontend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## API Endpoint Mapping

| Next.js Route | Node.js Route | Method | Description |
|---------------|---------------|---------|-------------|
| `/api/admin/transactions` | `/api/admin/transactions` | GET | Get admin transactions |
| `/api/buy-airtime` | `/api/airtime/buy` | POST | Buy airtime |
| `/api/buy-data` | `/api/data/buy` | POST | Buy data |
| `/api/get-data-plans` | `/api/data/plans` | GET | Get data plans |
| `/api/get-cable-plans` | `/api/cable/plans` | GET | Get cable plans |
| `/api/pay-cable` | `/api/cable/pay` | POST | Pay cable TV |
| `/api/get-utility-plans` | `/api/utility/plans` | GET | Get utility plans |
| `/api/pay-utility` | `/api/utility/pay` | POST | Pay utility |
| `/api/store-transaction` | `/api/transactions/store` | POST | Store transaction |
| `/api/store-pending-transaction` | `/api/pending-transactions/store` | POST | Store pending transaction |
| `/api/update-pending-transaction` | `/api/pending-transactions/:id/update` | PUT | Update pending transaction |
| `/api/refund` | `/api/refunds` | POST | Create refund |

## Running Both Servers

### Development Mode

1. **Start Node.js Backend**
   ```bash
   cd server
   npm run dev  # Runs on port 3001
   ```

2. **Start Next.js Frontend**
   ```bash
   # In another terminal
   npm run dev  # Runs on port 3000
   ```

### Production Mode

1. **Build and Start Backend**
   ```bash
   cd server
   npm run build
   npm start
   ```

2. **Build and Start Frontend**
   ```bash
   npm run build
   npm start
   ```

## Database Schema Changes

### New Tables Created
- `admin_users` - Admin authentication
- `transactions` - Transaction records
- `pending_transactions` - Pending transaction records
- `refunds` - Refund records

### Data Migration
If you have existing data in Supabase, you'll need to:
1. Export data from Supabase
2. Transform data to match new schema
3. Import into PostgreSQL

## Testing the Migration

### 1. Health Check
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","timestamp":"..."}
```

### 2. Admin Login
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@starkpay.com","password":"admin123"}'
```

### 3. Test API Endpoints
```bash
# Test airtime endpoint
curl -X POST http://localhost:3001/api/airtime/buy \
  -H "Content-Type: application/json" \
  -d '{"networkCode":"MTN","phoneNumber":"1234567890","amount":100}'
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database `starkpay` exists

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill process using port 3001

3. **CORS Errors**
   - Update `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches

4. **TypeScript Compilation Errors**
   - Run `npm run build` to see detailed errors
   - Check import paths and file extensions

### Logs
- Backend logs: Check terminal running `npm run dev`
- Database logs: Check PostgreSQL logs
- Frontend logs: Check browser console

## Rollback Plan

If you need to rollback:
1. Stop Node.js backend
2. Revert frontend API calls to Next.js routes
3. Restart Next.js development server
4. Your Supabase data remains unchanged

## Support

For migration issues:
1. Check the server logs
2. Verify database connectivity
3. Test individual endpoints
4. Review environment configuration

## Next Steps

After successful migration:
1. Update frontend environment variables
2. Test all API endpoints
3. Update any hardcoded API URLs
4. Consider adding monitoring and logging
5. Set up production deployment
