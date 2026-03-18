import Link from 'next/link'

export default function ProfileSidebar() {
  return (
    <aside className="w-48 shrink-0">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg p-6 mb-3">
        {/* 프로필 이미지 - 귀여운 캐릭터 */}
        <div className="flex justify-center mb-5">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-200 flex items-center justify-center">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
              {/* 머리 */}
              <circle cx="50" cy="40" r="28" fill="#ffa500" />
              {/* 귀 */}
              <circle cx="25" cy="20" r="10" fill="#ffa500" />
              <circle cx="75" cy="20" r="10" fill="#ffa500" />
              <circle cx="25" cy="20" r="6" fill="#ffb84d" />
              <circle cx="75" cy="20" r="6" fill="#ffb84d" />
              {/* 눈 */}
              <circle cx="40" cy="35" r="4" fill="#fff" />
              <circle cx="60" cy="35" r="4" fill="#fff" />
              <circle cx="41" cy="35" r="2.5" fill="#000" />
              <circle cx="61" cy="35" r="2.5" fill="#000" />
              {/* 반짝이 */}
              <circle cx="42" cy="33" r="1" fill="#fff" />
              <circle cx="62" cy="33" r="1" fill="#fff" />
              {/* 입 */}
              <path d="M 45 50 Q 50 53 55 50" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* 얼굴 */}
              <ellipse cx="50" cy="70" rx="22" ry="18" fill="#ffb84d" />
              {/* 뺨 */}
              <circle cx="28" cy="50" r="6" fill="#ffcccb" opacity="0.6" />
              <circle cx="72" cy="50" r="6" fill="#ffcccb" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* 이름 */}
        <h3 className="text-center font-bold text-gray-900 text-base">장진석</h3>
        <p className="text-center text-xs text-gray-500 mt-0.5 mb-3">grobiann</p>

        {/* 직책 */}
        <p className="text-center text-xs font-medium text-gray-700">5년차 게임 개발자</p>

        {/* 소개 */}
        <p className="text-center text-xs text-gray-600 mt-1 leading-relaxed mb-4">
          AI · 웹 학습 중
        </p>

        <hr className="my-4 border-gray-200" />

        {/* 링크 */}
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/grobiann"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo transition-colors"
            title="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="mailto:jinseok.jang@example.com"
            className="text-gray-600 hover:text-indigo transition-colors"
            title="Email"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </a>
        </div>
      </div>

    </aside>
  )
}
