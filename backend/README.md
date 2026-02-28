# AI Lab Notes Backend API

Backend API for the ai-lab-notes project built with Express.js, TypeScript, and PostgreSQL.

## Prerequisites

- Node.js 20.x or higher
- Docker & Docker Compose (for local PostgreSQL)
- npm

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start PostgreSQL (Docker)

From the project root:

```bash
docker-compose up -d postgres
```

Or start both backend and database:

```bash
docker-compose up
```

### 4. Create Database Schema

```bash
npm run migration:run
```

### 5. Seed Initial Data (Optional)

```bash
npm run seed
```

This creates an admin user with credentials from `.env`.

## Development

Start the development server:

```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run seed` - Seed initial data
- `npm run migration:generate` - Generate new database migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Posts
- `GET /api/posts` - List posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (admin only)
- `PUT /api/posts/:id` - Update post (admin only)
- `DELETE /api/posts/:id` - Delete post (admin only)

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment (requires auth)
- `PUT /api/comments/:id` - Update comment (author or admin)
- `DELETE /api/comments/:id` - Delete comment (author or admin)

### Health Check
- `GET /api/health` - API health status

## Database Schema

See database models in `src/models/`:
- `User.ts` - User entity
- `Post.ts` - Blog post entity
- `Comment.ts` - Comment entity
- `Tag.ts` - Tag entity (optional)

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/          # TypeORM entities
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── scripts/         # Utility scripts (seed, migration)
│   ├── utils/           # Helper functions
│   └── server.ts        # Main application file
├── dist/                # Compiled JavaScript (generated)
├── Dockerfile           # Docker build configuration
└── package.json
```

## Authentication

Uses JWT (JSON Web Tokens) for authentication:

1. User logs in with username/password
2. Receives `accessToken` and `refreshToken`
3. Include token in `Authorization: Bearer <token>` header

Token expiration:
- Access token: 24 hours
- Refresh token: 7 days

## Error Handling

API returns JSON error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Development Tips

- Enable debug logging by setting `NODE_ENV=development`
- Use TypeScript strict mode for type safety
- All database changes should be made through TypeORM entities
- Run migrations before deployment

## Production Deployment

See root project documentation for deployment configuration.
