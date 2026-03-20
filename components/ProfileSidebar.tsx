import Link from 'next/link'

export default function ProfileSidebar() {
  return (
    <aside className="w-52 shrink-0">
      {/* 프로필 카드 */}
      <div className="bg-card border border-cream-400 rounded-lg p-4 mb-3">
        {/* 프로필 이미지 */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-warm to-amber-light opacity-20 blur-lg" />
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-pale to-cream-100 border-3 border-amber-warm shadow-lg">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#c07a2f', stopOpacity: 0.9}} />
                    <stop offset="100%" style={{stopColor: '#d4923a', stopOpacity: 0.9}} />
                  </linearGradient>
                </defs>
                {/* 배경 */}
                <circle cx="50" cy="50" r="50" fill="#fdf3e3" />
                {/* 머리 */}
                <circle cx="50" cy="30" r="18" fill="url(#avatarGrad)" />
                {/* 몸 */}
                <ellipse cx="50" cy="75" rx="30" ry="28" fill="url(#avatarGrad)" />
                {/* 소매 강조 */}
                <ellipse cx="22" cy="65" rx="8" ry="12" fill="url(#avatarGrad)" opacity="0.7" />
                <ellipse cx="78" cy="65" rx="8" ry="12" fill="url(#avatarGrad)" opacity="0.7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 이름 */}
        <h3 className="text-center font-bold text-ink-dark text-sm">장진석</h3>
        <p className="text-center text-xs text-ink-muted mt-0.5">grobiann</p>

        {/* 소개 */}
        <p className="text-center text-xs text-ink-light mt-2 leading-relaxed">
          5년차 게임 개발자
          <br />
          AI · 웹 학습 중
        </p>

        <hr className="my-3 border-cream-300" />

        {/* 링크 */}
        <div className="flex justify-center gap-3">
          <a
            href="https://github.com/grobiann"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-ink-light hover:text-amber-warm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="bg-card border border-cream-400 rounded-lg overflow-hidden">
        {[
          { href: '/blog', label: '📝 블로그' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block px-4 py-2.5 text-sm text-ink-light hover:bg-cream-100 border-b border-cream-300 last:border-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-warm"
          >
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
