export default function BlogLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="h-10 w-24 bg-[#e8ddd0] rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#e8ddd0] rounded-xl p-6 animate-pulse">
            <div className="flex gap-2 mb-3">
              <div className="h-4 w-16 bg-[#e8ddd0] rounded-full" />
              <div className="h-4 w-24 bg-[#e8ddd0] rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-[#e8ddd0] rounded mb-2" />
            <div className="h-4 w-full bg-[#f0e8da] rounded mb-1" />
            <div className="h-4 w-2/3 bg-[#f0e8da] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
