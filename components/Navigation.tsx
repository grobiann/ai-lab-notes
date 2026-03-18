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

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-bold text-xl text-gray-900 hover:text-[#c07a2f] transition-colors"
          >
            AI Lab Notes
          </Link>
          <span className="text-sm text-gray-400">grobiann의 개발 블로그</span>
        </div>
        <div className="flex items-center gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm px-4 py-2 rounded-md transition-colors ${
                isActive(href)
                  ? 'text-indigo font-semibold bg-indigo-pale'
                  : 'text-gray-700 hover:text-indigo hover:bg-indigo-pale'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
