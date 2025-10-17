# Database Setup Instructions

## Current Status
✅ Prisma installed
✅ Schema created with all models
⏳ Need database connection

## Quick Start (SQLite for Development)

Since we don't have Supabase credentials yet, let's use SQLite for immediate development:

### Step 1: Create .env file
```bash
cd /Users/kumar/Documents/Projects/coursekeeper/coursekeeper/web
cp env.template .env
```

### Step 2: Configure for SQLite (temporary)
Edit `.env` and add:
```env
# Temporary SQLite for development
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

### Step 3: Update Prisma Schema for SQLite
The schema needs a small change for SQLite compatibility:
- Change provider from "postgresql" to "sqlite"
- Remove @db.Text annotations (SQLite doesn't need them)
- Remove directUrl (SQLite doesn't use it)

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Create Database Tables
```bash
npx prisma db push
```

This will create a local SQLite database file at `prisma/dev.db`.

## For Production (Supabase)

When you get Supabase credentials from your teammates:

### Option A: Create New Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy the connection strings

### Option B: Use Team's Supabase
Ask your teammates for:
- Database URL (pooled connection)
- Direct URL (direct connection)

### Update .env:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

### Switch Prisma back to PostgreSQL:
1. Change provider back to "postgresql"
2. Re-add @db.Text annotations
3. Re-add directUrl
4. Run: `npx prisma generate`
5. Run: `npx prisma db push`

## Testing the Connection

Create a test file:
```javascript
// test-db.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  console.log(`Database connected! User count: ${userCount}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

Run: `node test-db.js`

## Troubleshooting

### Error: "Can't reach database server"
- Check your .env file exists and has correct values
- For Supabase: verify project is not paused
- For local PostgreSQL: ensure it's running

### Error: "Schema mismatch"
- Run: `npx prisma db push --force-reset` (WARNING: deletes all data)

### SQLite Limitations
- No JSON columns (we use them for evidence/metadata)
- No concurrent writes
- Fine for development, must switch to PostgreSQL for production
