# Quick Start Guide - Backend Setup

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20.x
- Docker & Docker Compose
- Git

### Step 1: Set Environment Variables

```bash
cd backend
cp .env.example .env
```

Update `.env` if needed (defaults work for local development):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ai_lab_notes
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
ADMIN_USERNAME=grobiann
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-in-production
```

### Step 2: Start PostgreSQL

From the **project root** (not backend directory):

```bash
# Start just the database
docker-compose up -d postgres

# Or start everything (database + backend auto-start)
docker-compose up
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Run Migrations

```bash
npm run migration:run
```

### Step 5: Seed Admin User (Optional)

```bash
npm run seed
```

Creates admin user with credentials from `.env`

### Step 6: Start Development Server

```bash
npm run dev
```

✅ Server is running on `http://localhost:3000`

## 🧪 Test It Out

### Check API Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Copy the `accessToken` from the response and use it:

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 📚 Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript to JavaScript
npm start                # Run compiled JavaScript
npm run seed             # Seed initial data
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration
```

## 🐳 Docker Commands

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove volumes (clean everything)
docker-compose down -v
```

## 🆘 Troubleshooting

### Port 5432 Already in Use
PostgreSQL port is already taken. Either:
1. Stop the conflicting process
2. Edit `docker-compose.yml` and change `5432:5432` to `5433:5432`

### Migration Errors
```bash
# Check current migration status
npm run migration:run

# Reset everything (caution!)
docker-compose down -v
docker-compose up -d postgres
npm run migration:run
```

### Cannot Connect to Database
Ensure PostgreSQL is running:
```bash
docker-compose ps
# Should show 'postgres' as running
```

### Permission Denied on node_modules
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📖 Full Documentation

See `backend/README.md` for:
- Complete API documentation
- Project structure details
- Authentication details
- Production deployment info

See `BACKEND_IMPLEMENTATION.md` for:
- Full implementation progress
- Architecture decisions
- Security considerations
- All files created

## 🎯 Next Steps

1. **Phase 2** - Authentication system enhancements
2. **Phase 3** - Extended posts functionality
3. **Phase 4** - Comment system refinement
4. **Phase 5** - Migrate existing Markdown data
5. **Phase 6** - Frontend integration with React

---

## Quick API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/posts` | Optional | List posts |
| GET | `/api/posts/:id` | Optional | Get post detail |
| POST | `/api/posts` | Admin | Create post |
| PUT | `/api/posts/:id` | Admin | Update post |
| DELETE | `/api/posts/:id` | Admin | Delete post |
| POST | `/api/comments` | Yes | Create comment |
| GET | `/api/comments/post/:postId` | No | Get post comments |

For full API details, see `backend/README.md`
