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
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <header className="bg-card border-b border-cream-400 sticky top-0 z-20">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-lg text-ink-dark hover:text-amber-warm transition-colors"
        >
          블로그
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm ${
                isActive(href)
                  ? 'text-amber-warm font-semibold bg-amber-pale'
                  : 'text-ink-light hover:text-ink-dark hover:bg-cream-100'
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
