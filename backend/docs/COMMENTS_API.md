# Comments API Documentation

## Overview

The Comments API provides comprehensive functionality for managing blog post comments, including threaded/nested comments, comment likes, moderation, and search capabilities.

## New Features in Phase 4

✅ **Nested Comments** - Reply to comments directly
✅ **Comment Likes** - Users can like comments
✅ **Moderation System** - Approve/reject/spam filtering
✅ **Comment Search** - Full-text search within post comments
✅ **Comment Statistics** - Track metrics per post
✅ **Moderation Queue** - View pending comments

## Database Schema

### Comments Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `content` | TEXT | Comment text |
| `postId` | INT | Associated post |
| `userId` | INT | Comment author |
| `parentCommentId` | INT | Parent comment (null for top-level) |
| `isApproved` | BOOLEAN | Moderation status |
| `isSpam` | BOOLEAN | Spam flag |
| `moderationNote` | TEXT | Admin notes |
| `likeCount` | INT | Number of likes |
| `createdAt` | TIMESTAMP | Creation date |
| `updatedAt` | TIMESTAMP | Last update |

### Comment Likes Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `commentId` | INT | Referenced comment |
| `userId` | INT | User who liked |
| `createdAt` | TIMESTAMP | Creation date |

## API Endpoints

### Retrieve Comments

#### Get Post Comments (with replies)
**GET** `/api/comments/post/:postId`

Query parameters:
- `replies` - Include nested replies (`true` default, `false` to exclude)
- `all` - Include unapproved comments (admin only)

Example:
```bash
GET /api/comments/post/1?replies=true
```

Response:
```json
[
  {
    "id": 1,
    "content": "Great post!",
    "postId": 1,
    "userId": 2,
    "user": { "id": 2, "username": "john" },
    "parentCommentId": null,
    "isApproved": true,
    "isSpam": false,
    "likeCount": 5,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z",
    "replies": [
      {
        "id": 2,
        "content": "I agree!",
        "parentCommentId": 1,
        "userId": 3,
        "user": { "id": 3, "username": "jane" },
        "likeCount": 2,
        "replies": []
      }
    ]
  }
]
```

#### Get Comment Statistics (admin only)
**GET** `/api/comments/post/:postId/stats`

Response:
```json
{
  "total": 42,
  "approved": 40,
  "pending": 1,
  "spam": 1
}
```

#### Search Comments
**GET** `/api/comments/post/:postId/search?q=search+term`

Query parameters:
- `q` - Search query (required)

Example:
```bash
GET /api/comments/post/1/search?q=typescript
```

#### Get Pending Comments (admin only)
**GET** `/api/comments/moderate/pending?postId=1`

Query parameters:
- `postId` - Filter by post (optional)

Response:
```json
[
  {
    "id": 5,
    "content": "Check this out...",
    "isApproved": false,
    "moderationNote": null,
    "user": { "id": 10, "username": "suspicioususer" },
    "post": { "id": 1, "title": "My Post" }
  }
]
```

#### Get Comment Replies
**GET** `/api/comments/:id/replies`

Example:
```bash
GET /api/comments/1/replies
```

### Create Comments

#### Create Comment or Reply
**POST** `/api/comments`

Auth: Required

Request body:
```json
{
  "content": "Great article!",
  "postId": 1,
  "parentCommentId": null  // null for top-level, or comment ID for reply
}
```

Response (201):
```json
{
  "id": 3,
  "content": "Great article!",
  "postId": 1,
  "userId": 2,
  "parentCommentId": null,
  "isApproved": true,
  "isSpam": false,
  "likeCount": 0,
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

### Like Comments

#### Like a Comment
**POST** `/api/comments/:id/like`

Auth: Required

Response (200):
```json
{
  "likeCount": 6
}
```

Errors:
- `400` - Already liked this comment

#### Unlike a Comment
**DELETE** `/api/comments/:id/like`

Auth: Required

Response (200):
```json
{
  "likeCount": 5
}
```

#### Get Like Status
**GET** `/api/comments/:id/like-status`

Auth: Required

Response (200):
```json
{
  "userHasLiked": true,
  "likeCount": 6
}
```

### Manage Comments

#### Update Comment
**PUT** `/api/comments/:id`

Auth: Required (author or admin)

Request body:
```json
{
  "content": "Updated comment text"
}
```

#### Delete Comment
**DELETE** `/api/comments/:id`

Auth: Required (author or admin)

Response (200):
```json
{
  "message": "Comment deleted successfully"
}
```

### Moderation

#### Approve Comment
**PATCH** `/api/comments/:id/approve`

Auth: Admin only

Request body:
```json
{
  "note": "Approved - valid feedback"  // optional
}
```

Response (200):
```json
{
  "id": 5,
  "isApproved": true,
  "isSpam": false,
  "moderationNote": "Approved - valid feedback",
  ...
}
```

#### Reject Comment
**PATCH** `/api/comments/:id/reject`

Auth: Admin only

Request body:
```json
{
  "reason": "Off-topic discussion"  // required
}
```

Response (200):
```json
{
  "id": 5,
  "isApproved": false,
  "moderationNote": "Off-topic discussion",
  ...
}
```

#### Mark as Spam
**PATCH** `/api/comments/:id/spam`

Auth: Admin only

Response (200):
```json
{
  "id": 5,
  "isSpam": true,
  "isApproved": false,
  "moderationNote": "Marked as spam",
  ...
}
```

## Usage Examples

### Create a Top-Level Comment
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excellent article!",
    "postId": 1
  }'
```

### Reply to a Comment
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree with your point!",
    "postId": 1,
    "parentCommentId": 3
  }'
```

### Get All Comments with Replies
```bash
curl http://localhost:3000/api/comments/post/1?replies=true
```

### Like a Comment
```bash
curl -X POST http://localhost:3000/api/comments/42/like \
  -H "Authorization: Bearer $TOKEN"
```

### Search Comments on a Post
```bash
curl "http://localhost:3000/api/comments/post/1/search?q=important"
```

### Check Comment Stats (admin)
```bash
curl http://localhost:3000/api/comments/post/1/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Pending Comments for Moderation
```bash
curl http://localhost:3000/api/comments/moderate/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Approve a Comment
```bash
curl -X PATCH http://localhost:3000/api/comments/5/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "Good feedback"}'
```

### Mark Comment as Spam
```bash
curl -X PATCH http://localhost:3000/api/comments/5/spam \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Nested Comments

### Structure

Comments support parent-child relationships:

```
Comment 1
  └─ Reply 1.1
  └─ Reply 1.2
      └─ Reply 1.2.1
Comment 2
  └─ Reply 2.1
```

### Querying Nested Comments

Get top-level comments with all replies:
```bash
GET /api/comments/post/1?replies=true
```

Returns nested structure automatically.

Get replies to a specific comment:
```bash
GET /api/comments/1/replies
```

### Creating Nested Comments

Specify `parentCommentId` when creating:
```bash
POST /api/comments
{
  "content": "My reply",
  "postId": 1,
  "parentCommentId": 5  // Reply to comment #5
}
```

## Moderation System

### Status Flags

| Flag | Default | Use Case |
|------|---------|----------|
| `isApproved` | true | Comment awaiting moderation |
| `isSpam` | false | Flagged as spam |
| `moderationNote` | null | Admin notes on action taken |

### Moderation Workflow

1. **User creates comment** → `isApproved: true` (auto-approved)
2. **Admin reviews** → Approve, Reject, or Mark Spam
3. **Comment status updated** with reason

### Comment Stats

Get overview of comment moderation:

```json
{
  "total": 100,        // All comments
  "approved": 95,      // isApproved: true, isSpam: false
  "pending": 3,        // isApproved: false, isSpam: false
  "spam": 2            // isSpam: true
}
```

## Like System

### How Likes Work

1. User likes a comment → Entry in `comment_likes` table
2. `likeCount` on comment increments
3. User can unlike → Entry deleted, count decrements

### Unique Constraint

Each user can like a comment only once:
```sql
UNIQUE ("commentId", "userId")
```

### Check If User Liked

```bash
GET /api/comments/42/like-status
→ { "userHasLiked": true, "likeCount": 15 }
```

## Search

### Search Comments

Full-text search within a post's comments:

```bash
GET /api/comments/post/1/search?q=typescript
```

Searches:
- Comment content only
- Only approved comments
- Case-insensitive

## Error Handling

### 400 Bad Request
```json
{
  "error": "Content and postId are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "You can only edit your own comments"
}
```

### 404 Not Found
```json
{
  "error": "Comment not found"
}
```

## Best Practices

1. **Nested Comments**
   - Limit nesting depth to 3-5 levels for UX
   - Show parent comment context in replies
   - Indent visually to show hierarchy

2. **Moderation**
   - Review new comments in moderation queue
   - Add notes for consistency
   - Use spam flag for obvious spam/abuse

3. **Likes**
   - Show like count prominently
   - Highlight if user has liked
   - Update count in real-time

4. **Search**
   - Use for finding specific discussions
   - Combine with filtering by date
   - Useful for admin moderation

5. **Performance**
   - Set `replies=false` for large post comment lists
   - Paginate if over 100 comments
   - Cache comment counts

## Migration Notes

If upgrading from basic comments:

1. **Nested Comments**: `parentCommentId` defaults to null
2. **Moderation**: `isApproved` defaults to true (no review needed initially)
3. **Likes**: `likeCount` defaults to 0
4. **Spam**: `isSpam` defaults to false

Run migration:
```bash
npm run migration:run
```

## Future Enhancements

- [ ] Comment editing history
- [ ] Mention system (@username)
- [ ] Comment threading UI component
- [ ] Email notifications on replies
- [ ] Comment ratings (helpful/unhelpful)
- [ ] Spam detection AI
- [ ] Comment sentiment analysis
- [ ] Threaded email notifications
