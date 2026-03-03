'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <header className="border-b border-[#e8ddd0] bg-[#faf8f5]">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[#1a1208] hover:text-[#c07a2f] transition-colors"
        >
          AI Lab Notes
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className={`text-sm transition-colors ${
              isActive('/blog')
                ? 'text-[#c07a2f] font-medium'
                : 'text-[#7a6a52] hover:text-[#c07a2f]'
            }`}
          >
            Blog
          </Link>
          <Link
            href="/projects"
            className={`text-sm transition-colors ${
              isActive('/projects')
                ? 'text-[#c07a2f] font-medium'
                : 'text-[#7a6a52] hover:text-[#c07a2f]'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={`text-sm transition-colors ${
              isActive('/about')
                ? 'text-[#c07a2f] font-medium'
                : 'text-[#7a6a52] hover:text-[#c07a2f]'
            }`}
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  )
}
