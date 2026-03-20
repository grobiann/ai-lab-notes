import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-cream-400 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          © {new Date().getFullYear()} grobiann · AI Lab Notes
        </p>
        <Link
          href="/private"
          className="text-xs text-cream-500 hover:text-ink-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
        >
          admin
        </Link>
      </div>
    </footer>
  )
}
