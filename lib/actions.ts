'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateBlog() {
  revalidatePath('/', 'page')
  revalidatePath('/blog', 'page')
  revalidatePath('/blog/[slug]', 'page')
}

export async function revalidateProjects() {
  revalidatePath('/projects', 'page')
}
