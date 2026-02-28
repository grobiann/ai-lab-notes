# Posts API Documentation

## Overview

The Posts API provides comprehensive functionality for managing blog posts, including full-text search, filtering, categorization, featured posts, view tracking, and related posts discovery.

## New Features in Phase 3

✅ **Full-Text Search** - Search by title, content, and description
✅ **Tag Filtering** - Filter posts by multiple tags
✅ **Category Support** - Organize posts into categories
✅ **Featured Posts** - Highlight important posts
✅ **View Tracking** - Track post popularity by view count
✅ **Related Posts** - Discover similar posts by tags
✅ **URL Slugs** - SEO-friendly post URLs
✅ **Advanced Sorting** - Sort by newest, oldest, popular, or featured
✅ **Excerpt Generation** - Auto-generated post previews

## Database Schema

### Post Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `title` | VARCHAR(255) | Post title |
| `slug` | VARCHAR(300) | URL-friendly identifier |
| `content` | TEXT | Full post content |
| `description` | VARCHAR(500) | Short description |
| `excerpt` | TEXT | Auto-generated preview |
| `category` | VARCHAR(100) | Post category |
| `authorId` | INT | Author user ID |
| `publishedAt` | TIMESTAMP | Publication date |
| `isPublished` | BOOLEAN | Publication status |
| `isFeatured` | BOOLEAN | Featured post flag |
| `viewCount` | INT | Number of views |
| `lastViewedAt` | TIMESTAMP | Last view timestamp |
| `createdAt` | TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | Last update timestamp |

### Relationships

- **Author**: Many-to-One with User
- **Comments**: One-to-Many with Comment
- **Tags**: Many-to-Many with Tag

## API Endpoints

### Search and Discovery

#### Search Posts
**GET** `/api/posts/search`

Query parameters:
- `q` - Search query (title, content, description)
- `tags` - Comma-separated tag names
- `category` - Filter by category
- `sortBy` - Sort order: `newest`, `oldest`, `popular`, `featured`
- `featured` - Filter featured posts only (`true`/`false`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Example:
```bash
GET /api/posts/search?q=typescript&tags=backend,programming&sortBy=popular&page=1&limit=10
```

Response:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "TypeScript Best Practices",
      "slug": "typescript-best-practices",
      "content": "...",
      "description": "Learn TypeScript best practices",
      "excerpt": "TypeScript is a powerful language...",
      "category": "Programming",
      "author": { "id": 1, "username": "grobiann" },
      "tags": [
        { "id": 1, "name": "typescript" },
        { "id": 2, "name": "programming" }
      ],
      "isPublished": true,
      "isFeatured": true,
      "viewCount": 1523,
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-16T12:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### Get Featured Posts
**GET** `/api/posts/featured`

Query parameters:
- `limit` - Number of posts (default: 5, max: 50)

Example:
```bash
GET /api/posts/featured?limit=5
```

Response:
```json
[
  {
    "id": 1,
    "title": "Featured Post",
    "slug": "featured-post",
    "isFeatured": true,
    "viewCount": 5000,
    ...
  }
]
```

#### Get All Categories
**GET** `/api/posts/categories`

Response:
```json
[
  "Programming",
  "Database",
  "DevOps",
  "Testing"
]
```

#### Get Posts by Category
**GET** `/api/posts/category/:category`

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Example:
```bash
GET /api/posts/category/Programming?page=1&limit=10
```

#### Get Related Posts
**GET** `/api/posts/:id/related`

Query parameters:
- `limit` - Number of related posts (default: 5, max: 20)

Example:
```bash
GET /api/posts/1/related?limit=5
```

Returns posts with the same tags as the specified post.

### Basic Operations

#### Get All Posts
**GET** `/api/posts`

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Note: Non-admin users only see published posts.

```bash
GET /api/posts?page=1&limit=10
```

#### Get Post by ID
**GET** `/api/posts/:id`

Includes:
- Full content
- Comments with authors
- Tags
- Author information

Automatically records a view for published posts.

```bash
GET /api/posts/1
```

#### Create Post
**POST** `/api/posts`

Auth: Admin only

Request body:
```json
{
  "title": "My New Post",
  "content": "Full post content here...",
  "description": "Brief description",
  "excerpt": "Custom excerpt (optional)",
  "category": "Programming",
  "slug": "custom-slug (optional)",
  "isPublished": false
}
```

Response (201):
```json
{
  "id": 42,
  "title": "My New Post",
  "slug": "my-new-post",
  "content": "Full post content here...",
  "description": "Brief description",
  "excerpt": "Full post content here...",
  "category": "Programming",
  "authorId": 1,
  "author": { "id": 1, "username": "grobiann" },
  "isPublished": false,
  "isFeatured": false,
  "viewCount": 0,
  "publishedAt": null,
  "createdAt": "2024-01-17T10:00:00Z",
  "updatedAt": "2024-01-17T10:00:00Z"
}
```

#### Update Post
**PUT** `/api/posts/:id`

Auth: Admin only

Request body (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "description": "Updated description",
  "excerpt": "Updated excerpt",
  "category": "Programming",
  "slug": "updated-slug",
  "isPublished": true
}
```

Note: If title changes and slug is not provided, slug is auto-generated. If content changes and excerpt is not provided, excerpt is auto-generated.

#### Delete Post
**DELETE** `/api/posts/:id`

Auth: Admin only

Response (200):
```json
{
  "message": "Post deleted successfully"
}
```

### Post Lifecycle

#### Publish Post
**PATCH** `/api/posts/:id/publish`

Auth: Admin only

Publishes post and sets `publishedAt` to current time.

```bash
PATCH /api/posts/1/publish
```

#### Unpublish Post
**PATCH** `/api/posts/:id/unpublish`

Auth: Admin only

Unpublishes post and clears `publishedAt`.

```bash
PATCH /api/posts/1/unpublish
```

#### Feature Post
**PATCH** `/api/posts/:id/feature`

Auth: Admin only

Marks post as featured (displayed prominently).

```bash
PATCH /api/posts/1/feature
```

#### Unfeature Post
**PATCH** `/api/posts/:id/unfeature`

Auth: Admin only

Removes featured status.

```bash
PATCH /api/posts/1/unfeature
```

## Sorting Options

| Value | Description | Order |
|-------|-------------|-------|
| `newest` | Most recent first | `publishedAt DESC` |
| `oldest` | Oldest first | `publishedAt ASC` |
| `popular` | Most viewed first | `viewCount DESC` |
| `featured` | Featured posts first | `isFeatured DESC, publishedAt DESC` |

## Slug Generation

Slugs are automatically generated from titles:

```typescript
// "My Amazing Blog Post" → "my-amazing-blog-post"
// "Hello! World (2024)" → "hello-world-2024"
```

If a slug already exists, a counter is appended:
- `my-post` (taken)
- `my-post-1` (new)
- `my-post-2` (next)

## Excerpt Generation

Excerpts are auto-generated from content:

- Removes HTML tags
- Extracts first 150 characters
- Ends at word boundary
- Appends "..." if truncated

### Example Usage

```bash
# Create a draft post
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js",
    "content": "Node.js is a JavaScript runtime...",
    "description": "Learn Node.js from scratch",
    "category": "Backend",
    "isPublished": false
  }'

# Publish it later
curl -X PATCH http://localhost:3000/api/posts/42/publish \
  -H "Authorization: Bearer $TOKEN"

# Feature it
curl -X PATCH http://localhost:3000/api/posts/42/feature \
  -H "Authorization: Bearer $TOKEN"

# Search for similar posts
curl http://localhost:3000/api/posts/search?q=Node.js&sortBy=popular

# Get related posts
curl http://localhost:3000/api/posts/42/related?limit=5
```

## Search Examples

### Search by Title
```bash
GET /api/posts/search?q=typescript
```

### Filter by Category
```bash
GET /api/posts/search?category=Programming
```

### Filter by Tags
```bash
GET /api/posts/search?tags=javascript,node.js,backend
```

### Combination Filters
```bash
GET /api/posts/search?q=node&category=Backend&tags=javascript,performance&sortBy=popular
```

### Get Featured Posts by Category
```bash
GET /api/posts/search?category=Programming&featured=true
```

## View Tracking

- Views are automatically recorded when a post is retrieved by ID
- Only published posts track views
- `viewCount` increments by 1
- `lastViewedAt` updates to current timestamp
- Views appear in "popular" sort order

## Pagination

All list endpoints support pagination:

```bash
# Page 2, 20 items per page
GET /api/posts?page=2&limit=20

# Get total count from response
{
  "posts": [...],
  "total": 150,        // Total posts
  "page": 2,           // Current page
  "limit": 20,         // Items per page
  "totalPages": 8      // Calculated pages
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Title and content are required"
}
```

### 404 Not Found
```json
{
  "error": "Post not found"
}
```

### 403 Forbidden (Unpublished Post)
```json
{
  "error": "Post not found"
}
```

Note: Non-admin users cannot see unpublished posts (403 returned instead of revealing they exist).

## Best Practices

1. **Slug Management**
   - System generates slugs automatically
   - Customize slugs for SEO if needed
   - Slugs must be unique

2. **Content Organization**
   - Use categories to organize posts
   - Use tags for cross-cutting concerns
   - Write good descriptions for SEO

3. **Publication Workflow**
   - Create draft posts (unpublished)
   - Publish when ready
   - Feature important posts
   - Track views to measure engagement

4. **Searching**
   - Use full-text search for discovery
   - Combine filters for precise results
   - Sort by popularity for trending content

5. **Performance**
   - Paginate large result sets
   - Use appropriate page sizes
   - Cache featured posts client-side

## Migration from Basic Posts

If upgrading from basic posts API:

1. **Slugs**: Auto-generated from existing titles
2. **Excerpts**: Auto-generated from content
3. **Views**: Initialize to 0
4. **Featured**: Defaults to false
5. **Categories**: Optional, defaults to null

Run database migration:
```bash
npm run migration:run
```

## Future Enhancements

- [ ] Post scheduling (publish at specific time)
- [ ] Revision history
- [ ] Post status (draft, review, published)
- [ ] SEO optimization scores
- [ ] Social sharing metrics
- [ ] Reading time estimation
- [ ] Post templates
- [ ] Bulk operations
- [ ] Export to multiple formats
