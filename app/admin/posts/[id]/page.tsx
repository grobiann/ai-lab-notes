import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/dynamo'
import PostForm from '../../PostForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#1a1208] mb-8">
        글 수정
      </h1>
      <PostForm post={post} />
    </div>
  )
}
