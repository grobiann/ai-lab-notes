export default function ProjectsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-14">
        <div className="h-10 w-36 bg-[#e8ddd0] rounded animate-pulse" />
      </div>
      <div className="mb-16">
        <div className="h-7 w-40 bg-[#e8ddd0] rounded animate-pulse mb-6" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8ddd0] rounded-xl p-6 animate-pulse">
              <div className="h-5 w-1/2 bg-[#e8ddd0] rounded mb-2" />
              <div className="h-4 w-1/4 bg-[#f0e8da] rounded mb-3" />
              <div className="h-4 w-full bg-[#f0e8da] rounded mb-1" />
              <div className="h-4 w-3/4 bg-[#f0e8da] rounded" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-7 w-48 bg-[#e8ddd0] rounded animate-pulse mb-6" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8ddd0] rounded-xl p-6 animate-pulse">
              <div className="h-5 w-1/2 bg-[#e8ddd0] rounded mb-3" />
              <div className="h-4 w-full bg-[#f0e8da] rounded mb-1" />
              <div className="h-4 w-2/3 bg-[#f0e8da] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
