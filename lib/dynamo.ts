import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import { cache } from 'react'
import type { Post, Project } from '@/lib/types'

let docClient: DynamoDBDocumentClient | undefined

export function getDynamo(): DynamoDBDocumentClient {
  if (!docClient) {
    const ddb = new DynamoDBClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    docClient = DynamoDBDocumentClient.from(ddb, {
      marshallOptions: { removeUndefinedValues: true },
    })
  }
  return docClient
}

const postsTable = () => process.env.DYNAMODB_POSTS_TABLE!
const projectsTable = () => process.env.DYNAMODB_PROJECTS_TABLE!

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const { Items = [] } = await getDynamo().send(
    new ScanCommand({ TableName: postsTable() })
  )
  return (Items as Post[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getPublishedPosts(): Promise<Post[]> {
  const { Items = [] } = await getDynamo().send(
    new ScanCommand({
      TableName: postsTable(),
      FilterExpression: 'is_published = :pub',
      ExpressionAttributeValues: { ':pub': true },
    })
  )
  return (Items as Post[]).sort(
    (a, b) =>
      new Date(b.published_at ?? b.created_at).getTime() -
      new Date(a.published_at ?? a.created_at).getTime()
  )
}

export async function getPostById(id: string): Promise<Post | null> {
  const { Item } = await getDynamo().send(
    new GetCommand({ TableName: postsTable(), Key: { id } })
  )
  return (Item as Post | undefined) ?? null
}

// React cache deduplicates calls within a single render pass
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const { Items = [] } = await getDynamo().send(
    new ScanCommand({
      TableName: postsTable(),
      FilterExpression: '#slug = :slug AND is_published = :pub',
      ExpressionAttributeNames: { '#slug': 'slug' },
      ExpressionAttributeValues: { ':slug': slug, ':pub': true },
    })
  )
  return (Items[0] as Post | undefined) ?? null
})

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const { Items = [] } = await getDynamo().send(
    new ScanCommand({ TableName: projectsTable() })
  )
  return (Items as Project[]).sort((a, b) => a.display_order - b.display_order)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { Item } = await getDynamo().send(
    new GetCommand({ TableName: projectsTable(), Key: { id } })
  )
  return (Item as Project | undefined) ?? null
}
