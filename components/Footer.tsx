import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#e8ddd0] mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <p className="text-sm text-[#b0977a]">
          © {new Date().getFullYear()} grobiann · AI Lab Notes
        </p>
        <Link
          href="/private"
          className="text-xs text-[#d4c4b0] hover:text-[#b0977a] transition-colors"
        >
          admin
        </Link>
      </div>
    </footer>
  )
}
