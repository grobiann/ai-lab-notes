import type { Metadata } from 'next'
import { Playfair_Display, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '700', '900'],
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '700'],
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: 'AI Lab Notes',
    template: '%s | AI Lab Notes',
  },
  description: 'grobiann의 AI·개발 학습 블로그',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${playfair.variable} ${notoSansKR.variable} min-h-screen flex flex-col font-sans`}>
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
