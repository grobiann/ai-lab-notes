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
          <Link
            href="/private"
            className="text-[#d4c4b0] hover:text-[#b0977a] transition-colors"
            title="Private"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  )
}
