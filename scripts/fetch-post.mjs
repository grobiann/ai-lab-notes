/**
 * Fetch a post from DynamoDB by keyword and save as a temp markdown file.
 * Usage: node scripts/fetch-post.mjs <keyword>
 * Example: node scripts/fetch-post.mjs vat
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

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

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})
const doc = DynamoDBDocumentClient.from(client)
const table = process.env.DYNAMODB_POSTS_TABLE

const keyword = process.argv[2]?.toLowerCase()
if (!keyword) {
  console.error('Usage: node scripts/fetch-post.mjs <keyword>')
  process.exit(1)
}

const { Items = [] } = await doc.send(new ScanCommand({ TableName: table }))

const matches = Items.filter(
  (p) =>
    p.title?.toLowerCase().includes(keyword) ||
    p.slug?.toLowerCase().includes(keyword) ||
    p.category?.toLowerCase().includes(keyword)
)

if (matches.length === 0) {
  console.log('No matching posts found.')
  console.log('All posts:')
  Items.forEach((p) => console.log(`  [${p.id}] ${p.title} (slug: ${p.slug})`))
  process.exit(0)
}

if (matches.length > 1) {
  console.log('Multiple matches:')
  matches.forEach((p) => console.log(`  [${p.id}] ${p.title} (slug: ${p.slug})`))
  console.log('\nSaving first match. Pass a more specific keyword to narrow down.')
}

const post = matches[0]
console.log(`\nFetched: [${post.id}] "${post.title}"`)

const md = `---
id: ${post.id}
title: ${post.title}
slug: ${post.slug}
description: ${post.description ?? ''}
category: ${post.category ?? ''}
tags: ${JSON.stringify(post.tags ?? [])}
is_published: ${post.is_published}
published_at: ${post.published_at ?? ''}
---

${post.content}
`

const tmpDir = resolve('tmp')
mkdirSync(tmpDir, { recursive: true })
const outPath = resolve(tmpDir, `post-${post.slug}.md`)
writeFileSync(outPath, md, 'utf-8')
console.log(`Saved to: ${outPath}`)
console.log('\nEdit the file (and place images in the same tmp/ folder), then run:')
console.log(`  node scripts/push-post.mjs tmp/post-${post.slug}.md`)
