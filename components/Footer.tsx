export default function Footer() {
  return (
    <footer className="border-t border-[#e8ddd0] mt-20">
      <div className="max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-[#b0977a]">
          © {new Date().getFullYear()} grobiann · AI Lab Notes
        </p>
      </div>
    </footer>
  )
}
