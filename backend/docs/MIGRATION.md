# Data Migration Guide: Markdown to PostgreSQL

## Overview

This guide explains how to migrate existing Markdown blog posts to the PostgreSQL database.

## Supported Markdown Format

The migration script supports Markdown files with YAML front matter:

```markdown
---
title: My Blog Post
description: A brief description
date: 2024-01-15
tags: [javascript, tutorial, beginners]
category: Programming
published: true
featured: false
slug: custom-url-slug
author: grobiann
---

# Your Blog Post Content

This is the actual blog content...
```

### Front Matter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Post title |
| `description` | String | No | Brief description (SEO) |
| `date` | String | No | Publication date (ISO format) |
| `tags` | Array | No | Post tags: `[tag1, tag2]` or `tag1, tag2` |
| `category` | String | No | Post category |
| `published` | Boolean | No | Publish status (default: true) |
| `featured` | Boolean | No | Featured post flag (default: false) |
| `slug` | String | No | URL-friendly slug (auto-generated if omitted) |
| `author` | String | No | Author name (stored as metadata) |

## Markdown Examples

### Minimal Format
```markdown
---
title: Simple Post
---

# Introduction

This is a simple blog post with minimal metadata.
```

### Full Format
```markdown
---
title: Complete Blog Post
description: This is a complete example with all fields
date: 2024-01-15
tags: [nodejs, express, backend]
category: Backend Development
published: true
featured: true
slug: complete-blog-post
author: grobiann
---

# Introduction

Full blog post content here...
```

### Tags Format
Both formats are supported:

```yaml
# Array format
tags: [javascript, typescript, tutorial]

# Comma-separated format
tags: javascript, typescript, tutorial
```

## Migration Steps

### 1. Prepare Markdown Files

Organize your Markdown files in the expected directory:

```
your-project/
└── docs/
    └── content/
        └── blog/
            ├── post-1.md
            ├── post-2.md
            └── post-3.md
```

### 2. Update Front Matter

Ensure all Markdown files have proper front matter:

```bash
# Check for files without front matter
grep -L "^---" docs/content/blog/*.md
```

### 3. Run Migration Script

```bash
cd backend
npm run migration
```

Or explicitly:

```bash
npx ts-node src/scripts/migrate-from-markdown.ts
```

### 4. Review Results

The script will output:

```
✓ Database connected
Found 42 Markdown files

Starting migration...

✓ Migrated: Getting Started with Node.js
✓ Migrated: TypeScript Best Practices
⊘ Skipped (already exists): Existing Post
✗ Error migrating: Bad Post

==================================================
Migration Summary
==================================================
Total files:     42
Successful:      40
Failed:          1
Skipped:         1
==================================================
```

## Migration Details

### What Gets Migrated

✅ **Post Title** → `posts.title`
✅ **Content** → `posts.content` (Markdown preserved)
✅ **Description** → `posts.description`
✅ **Tags** → `tags` table (auto-created if missing)
✅ **Category** → `posts.category`
✅ **Published Status** → `posts.isPublished`
✅ **Featured Flag** → `posts.isFeatured`
✅ **Slug** → `posts.slug` (auto-generated if missing)
✅ **Auto Excerpt** → `posts.excerpt` (150 chars from content)

### Author Assignment

All migrated posts are assigned to the admin user specified in `.env`:

```env
ADMIN_USERNAME=grobiann
```

### Dates

Publication date in front matter is informational. Actual timestamps:

- `createdAt` - Current time during migration
- `publishedAt` - Set to current time if `published: true`

### Tags

Tags are automatically created if they don't exist:

```
Front Matter: tags: [javascript, nodejs]
              ↓
Database:     - Create tag "javascript" (if missing)
              - Create tag "nodejs" (if missing)
              - Link both tags to post
```

### Slug Generation

Slugs are auto-generated from titles if not provided:

```
Title: "My Awesome Blog Post"
Generated Slug: "my-awesome-blog-post"
```

If slug already exists, a counter is appended:
- `my-post` (taken)
- `my-post-1` (new)

## Validation

The script validates each file:

✅ Title is present
✅ Content is not empty
✅ Valid YAML front matter

Failed files are reported with specific errors:

```
✗ Validation failed: broken-post.md
  - Missing required field: title
  - Content is empty
```

## Error Handling

### Common Errors

**"Missing required field: title"**
- Solution: Add `title:` to front matter

**"Content is empty"**
- Solution: Add content after front matter

**"Already exists"**
- Solution: Post is skipped (already migrated or duplicate slug)

**Database errors**
- Check database connection
- Verify PostgreSQL is running
- Check `.env` configuration

### Rollback

If migration fails, no data is lost. The script:

1. Only creates new posts
2. Skips existing posts
3. Doesn't modify existing data
4. Reports all errors clearly

To retry:
1. Fix the errors
2. Run migration again
3. Failed posts can be re-migrated

## Advanced Usage

### Custom Directory

Modify the script to use a different directory:

```typescript
// In migrate-from-markdown.ts
const markdownDir = path.join(process.cwd(), 'your-custom-path');
```

Then run:

```bash
npx ts-node src/scripts/migrate-from-markdown.ts
```

### Selective Migration

Create a modified script for specific files:

```typescript
// Modify findMarkdownFiles() to filter
const files = findMarkdownFiles(markdownDir)
  .filter(f => f.includes('specific-folder'));
```

### Dry Run

To test without modifying database:

```typescript
// Add before postService.createPost():
console.log('Would migrate:', parsed.frontmatter.title);
continue; // Skip actual creation
```

## Post-Migration Tasks

### 1. Verify Data

```bash
# Check post count
SELECT COUNT(*) FROM posts;

# Check tags were created
SELECT * FROM tags;

# Check post-tag relationships
SELECT * FROM post_tags;
```

### 2. Update Featured Posts

If you didn't mark featured posts in front matter:

```bash
# Mark specific post as featured
UPDATE posts SET isFeatured = true WHERE id = 1;
```

### 3. Update Categories

If posts lack category metadata:

```bash
# Batch update categories
UPDATE posts SET category = 'Tutorials' WHERE title LIKE '%tutorial%';
```

### 4. Review Published Status

```bash
# Check for unpublished posts
SELECT id, title, isPublished FROM posts WHERE isPublished = false;
```

### 5. Test Frontend

1. Start backend: `npm run dev`
2. Fetch posts: `GET /api/posts`
3. Verify: Title, content, tags all present

## Troubleshooting

### Migration hangs

- Check database connection
- Verify PostgreSQL is running
- Kill the process and try again

### Out of memory

- Reduce file count (migrate in batches)
- Increase Node.js memory: `node --max-old-space-size=4096 script.js`

### Special characters in content

The migration handles:
- Unicode characters (UTF-8)
- Code blocks with syntax highlighting
- Links and images
- HTML (preserved as-is)

### Missing tags/categories

Tags are created automatically during migration. If not appearing:

```bash
# Manually create missing tag
INSERT INTO tags (name) VALUES ('missing-tag');

# Link to post (if needed)
INSERT INTO post_tags (postId, tagId) VALUES (1, 123);
```

## Performance

Typical migration times:

- 10 files: < 1 second
- 100 files: 2-5 seconds
- 1000 files: 30-60 seconds

For large migrations:
1. Monitor database performance
2. Consider batch processing
3. Increase connection timeout if needed

## Example Workflow

```bash
# 1. Prepare files
# Ensure all .md files have proper front matter

# 2. Setup database
npm run migration:run

# 3. Configure admin user
# Edit .env with admin credentials

# 4. Run migration
npm run migration

# 5. Verify results
curl http://localhost:3000/api/posts

# 6. Check database
psql -U postgres -d ai_lab_notes
SELECT COUNT(*) FROM posts;
SELECT * FROM tags;
```

## Supported Markdown Features

All standard Markdown is preserved:

✅ **Headings**: `# Heading 1`, `## Heading 2`, etc.
✅ **Emphasis**: `**bold**`, `*italic*`
✅ **Lists**: Ordered and unordered
✅ **Code blocks**: Fenced with ``` ```
✅ **Inline code**: `` `code` ``
✅ **Links**: `[text](url)`
✅ **Images**: `![alt](url)`
✅ **Blockquotes**: `> Quote`
✅ **Tables**: Standard Markdown tables
✅ **HTML**: Raw HTML (preserved)

## Next Steps

After migration:

1. **Frontend Integration**: Connect React to API
2. **Post Comments**: Enable comment system
3. **Post Search**: Use full-text search
4. **Featured Posts**: Display featured posts
5. **Categories**: Filter by category

## Support

For issues:

1. Check error messages (detailed)
2. Review this guide (common errors section)
3. Check database directly
4. Review script output logs

## Backup

Before migration:

```bash
# Backup PostgreSQL database
pg_dump -U postgres -d ai_lab_notes > backup.sql

# Backup Markdown files
cp -r docs/content/blog docs/content/blog.backup
```

## Rollback

If needed:

```bash
# Restore from backup
psql -U postgres -d ai_lab_notes < backup.sql

# Or delete migrated posts
DELETE FROM posts WHERE authorId = (SELECT id FROM users WHERE username = 'grobiann');
```
