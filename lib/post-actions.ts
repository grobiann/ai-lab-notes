'use server'

import { getDynamo } from '@/lib/dynamo'
import {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { revalidatePath } from 'next/cache'
import type { Post } from '@/lib/types'

type PostPayload = Omit<Post, 'id' | 'created_at'>

const postsTable = () => process.env.DYNAMODB_POSTS_TABLE!

function buildUpdate(fields: Record<string, unknown>) {
  const names: Record<string, string> = {}
  const values: Record<string, unknown> = {}
  const parts: string[] = []
  Object.entries(fields).forEach(([k, v], i) => {
    names[`#u${i}`] = k
    values[`:u${i}`] = v
    parts.push(`#u${i} = :u${i}`)
  })
  return {
    UpdateExpression: 'SET ' + parts.join(', '),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }
}

function revalidate() {
  revalidatePath('/', 'page')
  revalidatePath('/blog', 'page')
  revalidatePath('/blog/[slug]', 'page')
}

export async function createPost(payload: PostPayload): Promise<void> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await getDynamo().send(
    new PutCommand({
      TableName: postsTable(),
      Item: {
        id,
        title: payload.title,
        slug: payload.slug,
        description: payload.description ?? null,
        category: payload.category ?? null,
        content: payload.content,
        tags: payload.tags,
        is_published: payload.is_published,
        published_at: payload.published_at ?? null,
        created_at: now,
        updated_at: payload.updated_at,
      },
    })
  )
  revalidate()
}

export async function updatePost(id: string, payload: PostPayload): Promise<void> {
  const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
    buildUpdate({
      title: payload.title,
      slug: payload.slug,
      description: payload.description ?? null,
      category: payload.category ?? null,
      content: payload.content,
      tags: payload.tags,
      is_published: payload.is_published,
      published_at: payload.published_at ?? null,
      updated_at: payload.updated_at,
    })

  await getDynamo().send(
    new UpdateCommand({
      TableName: postsTable(),
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  )
  revalidate()
}

export async function deletePost(id: string): Promise<void> {
  await getDynamo().send(
    new DeleteCommand({ TableName: postsTable(), Key: { id } })
  )
  revalidate()
}
