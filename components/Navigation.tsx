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
          grobiann의 블로그
        </Link>
      </nav>
    </header>
  )
}
