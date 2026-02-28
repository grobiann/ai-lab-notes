# AI Lab Notes - Full-Stack Blog Platform

A modern, full-stack blog platform built with React, Express.js, PostgreSQL, and Docker. Features include user authentication, nested comments, admin dashboard, and full-text search capabilities.

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/ai-lab-notes.git
cd ai-lab-notes

# Start all services with Docker Compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# Database: localhost:5432
```

### Without Docker

```bash
# Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:3000

# Frontend (in another terminal)
cd frontend
npm install
npm start  # Runs on http://localhost:3000 (via React Scripts)
```

## 📋 Project Structure

```
ai-lab-notes/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/            # Database and environment config
│   │   ├── models/            # TypeORM entities
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Authentication, error handling
│   │   └── server.ts          # Main entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API client
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React Context (Auth)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Main app with routing
│   │   └── index.css          # Global styles
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│       ├── test-and-build.yml # Testing and building
│       └── deploy.yml         # Production deployment
│
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
├── nginx.conf                 # Reverse proxy configuration
├── DEPLOYMENT.md              # Deployment guide
├── SERVER_SETUP.md            # Server setup instructions
└── README.md
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         React Frontend (localhost:3001)          │
│  - Blog listing, post detail, comments          │
│  - User authentication                          │
│  - Admin dashboard for content management       │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────────┐
│    Express.js Backend API (localhost:3000)      │
│  - RESTful API endpoints                        │
│  - JWT authentication                           │
│  - Database business logic                      │
│  - Full-text search                             │
└──────────────────┬──────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────┐
│    PostgreSQL Database (localhost:5432)         │
│  - Users, Posts, Comments, Tags                 │
│  - Indexes for performance                      │
└─────────────────────────────────────────────────┘
```

## ✨ Features

### Blog Features
- 📝 **Blog Posts**: Create, read, update, delete blog posts with markdown support
- 🏷️ **Tags & Categories**: Organize posts with tags and categories
- 🔍 **Full-Text Search**: Search posts by keyword, category, or tags
- ⭐ **Featured Posts**: Highlight important articles
- 📊 **View Tracking**: Track post views and trending content
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

### Comment System
- 💬 **Nested Comments**: Support for replies and threaded discussions
- ❤️ **Comment Likes**: Users can like comments
- 🛡️ **Moderation**: Admin approval system for comments
- 📌 **Comment Management**: Edit, delete, and moderate comments

### Authentication & Authorization
- 👤 **User Registration**: Create new user accounts
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🔄 **Token Refresh**: Automatic token refresh mechanism
- 👨‍💼 **Role-Based Access**: Admin-only features
- 🚪 **Protected Routes**: Secure pages for authenticated users

### Admin Features
- 📋 **Dashboard**: Overview of posts and comments
- ✏️ **Content Management**: Create, edit, publish, and delete posts
- 🛡️ **Comment Moderation**: Approve, reject, or mark spam
- 📅 **Publication Control**: Draft and publish posts
- ⭐ **Feature Posts**: Pin important posts to featured section

## 🔧 Technology Stack

### Backend
- **Node.js 20** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - Object-relational mapper
- **PostgreSQL** - SQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **TypeScript** - Type safety
- **CSS3** - Styling with responsive design
- **Fetch API** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD pipeline
- **PostgreSQL** - Database

## 📦 API Endpoints

### Authentication
```
POST   /api/auth/register      - Create user account
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
POST   /api/auth/refresh       - Refresh access token
GET    /api/auth/me            - Current user info
```

### Posts
```
GET    /api/posts              - List posts (paginated)
GET    /api/posts/:id          - Get post by ID
GET    /api/posts/slug/:slug   - Get post by slug
GET    /api/posts/search       - Search posts
GET    /api/posts/featured     - Get featured posts
POST   /api/posts              - Create post (admin)
PUT    /api/posts/:id          - Update post (admin)
DELETE /api/posts/:id          - Delete post (admin)
PATCH  /api/posts/:id/publish  - Publish post (admin)
```

### Comments
```
GET    /api/comments/post/:postId     - Get comments for post
POST   /api/comments                  - Create comment
PUT    /api/comments/:id              - Edit comment
DELETE /api/comments/:id              - Delete comment
POST   /api/comments/:id/like         - Like comment
DELETE /api/comments/:id/like         - Unlike comment
```

See [API Documentation](./backend/README.md) for complete API reference.

## 🚀 Deployment

### Quick Deployment with Docker Compose

```bash
# Copy environment template
cp .env.production.example .env.production
nano .env.production  # Configure production values

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run typeorm migration:run

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Automated Deployment with GitHub Actions

1. Push to `main` branch
2. GitHub Actions automatically:
   - Runs tests
   - Builds Docker images
   - Pushes to registry
   - Deploys to production server
   - Runs database migrations

For detailed setup, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [SERVER_SETUP.md](./SERVER_SETUP.md).

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  author_id INTEGER REFERENCES users(id),
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  parent_comment_id INTEGER REFERENCES comments(id),
  is_approved BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

- ✅ **HTTPS/SSL**: Encrypted communication
- ✅ **JWT Tokens**: Secure authentication
- ✅ **Password Hashing**: Bcrypt with 10 salt rounds
- ✅ **CORS**: Configured origin restrictions
- ✅ **Rate Limiting**: Request rate limiting
- ✅ **SQL Injection Protection**: Parameterized queries via ORM
- ✅ **XSS Protection**: Input sanitization
- ✅ **Security Headers**: HTTP security headers
- ✅ **Environment Variables**: Secrets management

## 📝 Environment Configuration

### Development (.env)
```
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
JWT_SECRET=dev-secret-key
PORT=3000
REACT_APP_API_URL=http://localhost:3000/api
```

### Production (.env.production)
```
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_PASSWORD=secure-password
JWT_SECRET=secure-random-key
REFRESH_TOKEN_SECRET=secure-random-key
CORS_ORIGIN=https://yourdomain.com
```

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation and backend setup
- [Frontend README](./frontend/README.md) - Frontend setup and components
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Server Setup Guide](./SERVER_SETUP.md) - Server configuration guide

## 🛠️ Development Workflow

### Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Commit Changes
```bash
git add .
git commit -m "feat: describe your changes"
```

### Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

### Merge After Review
```bash
git checkout main
git pull
git merge feature/your-feature-name
git push
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify database host and credentials
docker exec ai_lab_notes_db psql -U postgres -c "SELECT 1"
```

### Frontend Can't Connect to API
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check CORS headers
curl -H "Origin: http://localhost:3001" http://localhost:3000/api/posts

# Verify API URL in frontend .env
cat frontend/.env
```

### Migrations Failed
```bash
# Check migration status
docker-compose exec backend npm run typeorm migration:show

# Revert last migration
docker-compose exec backend npm run typeorm migration:revert

# Run migrations again
docker-compose exec backend npm run typeorm migration:run
```

## 📈 Performance Optimization

- Database indexes on frequently queried columns
- Pagination for post listings
- Image optimization and lazy loading
- Gzip compression on HTTP responses
- Docker layer caching for faster builds
- Nginx reverse proxy with caching

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review error logs in Docker containers

## 🎯 Roadmap

- [ ] Email notifications for comments
- [ ] User profiles with avatar upload
- [ ] Social sharing integration
- [ ] Analytics dashboard
- [ ] API rate limiting per user
- [ ] Comment threading improvements
- [ ] Mobile app (React Native)
- [ ] Elasticsearch integration for better search

## 👨‍💻 Author

- **Your Name** - Initial work and deployment

---

Happy blogging! 🚀
