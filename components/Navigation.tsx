import Link from 'next/link'

export default function Navigation() {
  return (
    <header className="border-b border-[#e8ddd0] bg-[#faf8f5]">
      <nav className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[#1a1208] hover:text-[#c07a2f] transition-colors"
        >
          AI Lab Notes
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className="text-sm text-[#7a6a52] hover:text-[#c07a2f] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/projects"
            className="text-sm text-[#7a6a52] hover:text-[#c07a2f] transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="text-sm text-[#7a6a52] hover:text-[#c07a2f] transition-colors"
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  )
}
