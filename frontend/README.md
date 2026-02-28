# AI Lab Notes Frontend

React-based frontend for the AI Lab Notes blog platform.

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
```

Edit `.env.local` if the API is running on a different URL.

### Development

Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── PostList.tsx
│   ├── PostDetail.tsx
│   ├── CommentSection.tsx
│   ├── SearchFilters.tsx
│   ├── CreatePostForm.tsx
│   ├── AdminDashboard.tsx
│   └── ProtectedRoute.tsx
├── context/             # React Context providers
│   └── AuthContext.tsx
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── BlogListPage.tsx
│   ├── BlogDetailPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── AdminPage.tsx
│   └── NotFoundPage.tsx
├── services/            # API client
│   └── api.ts
├── hooks/               # Custom React hooks
│   └── useApi.ts
├── types/               # TypeScript interfaces
│   └── api.ts
├── App.tsx              # Main app component with routing
├── index.tsx            # Entry point
└── index.css            # Global styles
```

## Features

- **Blog Reading**: Browse and read published blog posts
- **Search & Filter**: Search posts by keyword, category, and tags
- **Comments**: Read and post comments on blog posts (nested replies)
- **User Authentication**: Register and login to access admin features
- **Admin Dashboard**: Create, edit, publish, and delete blog posts
- **Responsive Design**: Mobile-friendly interface

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`.

### Key API Features:
- User authentication with JWT tokens
- Automatic token refresh on expiration
- Token persistence in localStorage
- Full-text search for posts
- Nested comment system
- Admin moderation capabilities

## Technologies

- React 18
- React Router 6
- TypeScript
- CSS3 with responsive design

## Notes

- The frontend uses localStorage for storing JWT tokens
- Comments require user authentication
- Admin routes are protected and require admin privileges
- The API base URL can be configured via environment variables
