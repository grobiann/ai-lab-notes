'use server'

import { getDynamo } from '@/lib/dynamo'
import {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

type ProjectPayload = Omit<Project, 'id' | 'created_at'>

const projectsTable = () => process.env.DYNAMODB_PROJECTS_TABLE!

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

export async function createProject(payload: ProjectPayload): Promise<void> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await getDynamo().send(
    new PutCommand({
      TableName: projectsTable(),
      Item: {
        id,
        title: payload.title,
        company: payload.company ?? null,
        period: payload.period ?? null,
        description: payload.description,
        tags: payload.tags,
        type: payload.type,
        github: payload.github ?? null,
        demo: payload.demo ?? null,
        display_order: payload.display_order,
        created_at: now,
        updated_at: payload.updated_at,
      },
    })
  )
  revalidatePath('/projects', 'page')
}

export async function updateProject(id: string, payload: ProjectPayload): Promise<void> {
  const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
    buildUpdate({
      title: payload.title,
      company: payload.company ?? null,
      period: payload.period ?? null,
      description: payload.description,
      tags: payload.tags,
      type: payload.type,
      github: payload.github ?? null,
      demo: payload.demo ?? null,
      display_order: payload.display_order,
      updated_at: payload.updated_at,
    })

  await getDynamo().send(
    new UpdateCommand({
      TableName: projectsTable(),
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  )
  revalidatePath('/projects', 'page')
}

export async function deleteProject(id: string): Promise<void> {
  await getDynamo().send(
    new DeleteCommand({ TableName: projectsTable(), Key: { id } })
  )
  revalidatePath('/projects', 'page')
}
