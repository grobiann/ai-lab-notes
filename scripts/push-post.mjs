/**
 * Push an edited markdown post back to DynamoDB, uploading any local images to S3.
 * Usage: node scripts/push-post.mjs <markdown-file>
 *
 * Images: place local image files in the same directory and reference them in markdown as:
 *   ![alt](./image.png)
 * They will be uploaded to S3 and the references replaced with S3 URLs.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { resolve, dirname, basename, extname } from 'path'
import { createHash } from 'crypto'
function mimeLookup(ext) {
  const map = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

// Load .env.local manually
try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    process.env[key] = value
  }
} catch {}

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/push-post.mjs <markdown-file>')
  process.exit(1)
}

const fullPath = resolve(filePath)
const dir = dirname(fullPath)
const raw = readFileSync(fullPath, 'utf-8')

// Parse frontmatter
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/m)
if (!fmMatch) {
  console.error('Could not parse frontmatter. Make sure the file starts with ---')
  process.exit(1)
}

const fmLines = fmMatch[1]
const bodyRaw = fmMatch[2].trim()

function getFm(key) {
  const m = fmLines.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return m ? m[1].trim() : ''
}

const id = getFm('id')
const title = getFm('title')
const slug = getFm('slug')
const description = getFm('description') || null
const category = getFm('category') || null
const tagsRaw = getFm('tags')
const tags = tagsRaw ? JSON.parse(tagsRaw) : []
const isPublished = getFm('is_published') === 'true'
const publishedAt = getFm('published_at') || null

if (!id || !title || !slug) {
  console.error('Missing required frontmatter: id, title, or slug')
  process.exit(1)
}

// Upload local images to S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})
const bucket = process.env.AWS_S3_BUCKET
const s3PublicUrl = process.env.AWS_S3_PUBLIC_URL?.replace(/\/$/, '')

let body = bodyRaw
const imageRefs = [...bodyRaw.matchAll(/!\[([^\]]*)\]\((\.[^)]+)\)/g)]

for (const [full, alt, imgPath] of imageRefs) {
  const absImg = resolve(dir, imgPath)
  if (!existsSync(absImg)) {
    console.warn(`  Image not found, skipping: ${absImg}`)
    continue
  }
  const data = readFileSync(absImg)
  const hash = createHash('md5').update(data).digest('hex').slice(0, 8)
  const ext = extname(imgPath)
  const key = `posts/${slug}/${hash}${ext}`
  const mime = mimeLookup(ext) || 'application/octet-stream'

  console.log(`  Uploading ${basename(imgPath)} → s3://${bucket}/${key}`)
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: mime,
  }))

  const url = `${s3PublicUrl}/${key}`
  body = body.replace(full, `![${alt}](${url})`)
  console.log(`  → ${url}`)
}

// Update DynamoDB
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}))

const now = new Date().toISOString()

await ddb.send(new UpdateCommand({
  TableName: process.env.DYNAMODB_POSTS_TABLE,
  Key: { id },
  UpdateExpression: `SET
    title = :title,
    slug = :slug,
    description = :description,
    category = :category,
    tags = :tags,
    content = :content,
    is_published = :is_published,
    published_at = :published_at,
    updated_at = :updated_at`,
  ExpressionAttributeValues: {
    ':title': title,
    ':slug': slug,
    ':description': description,
    ':category': category,
    ':tags': tags,
    ':content': body,
    ':is_published': isPublished,
    ':published_at': publishedAt || null,
    ':updated_at': now,
  },
}))

console.log(`\nUpdated post "${title}" in DynamoDB.`)
console.log(`updated_at: ${now}`)

// Cleanup prompt
console.log(`\nDone! To clean up the temp file run:`)
console.log(`  rm ${filePath}`)
