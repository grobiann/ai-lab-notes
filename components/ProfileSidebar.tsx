import Link from 'next/link'

export default function ProfileSidebar() {
  return (
    <aside className="w-52 shrink-0">
      {/* 프로필 카드 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        {/* 프로필 이미지 */}
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="80" height="80" fill="#e5e7eb" />
              <circle cx="40" cy="30" r="16" fill="#9ca3af" />
              <ellipse cx="40" cy="72" rx="26" ry="22" fill="#9ca3af" />
            </svg>
          </div>
        </div>

        {/* 이름 */}
        <h3 className="text-center font-bold text-gray-900 text-sm">장진석</h3>
        <p className="text-center text-xs text-gray-400 mt-0.5">grobiann</p>

        {/* 소개 */}
        <p className="text-center text-xs text-gray-500 mt-2 leading-relaxed">
          5년차 게임 개발자
          <br />
          AI · 웹 학습 중
        </p>

        <hr className="my-3 border-gray-100" />

        {/* 링크 */}
        <div className="flex justify-center gap-3">
          <a
            href="https://github.com/grobiann"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {[
          { href: '/', label: '🏠 홈' },
          { href: '/blog', label: '📝 블로그' },
          { href: '/projects', label: '🗂 프로젝트' },
          { href: '/about', label: '👤 소개' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
