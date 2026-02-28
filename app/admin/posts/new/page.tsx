import PostForm from '../../PostForm'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-[#1a1208] mb-8">
        새 글 작성
      </h1>
      <PostForm />
    </div>
  )
}
