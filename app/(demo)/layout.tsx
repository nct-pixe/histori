import Link from 'next/link'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* デモバナー */}
      <div className="bg-amber-400 text-amber-900 text-center py-2 text-base font-bold">
        🎬 デモモード — データはブラウザ内のみ保存されます
      </div>

      {/* ナビ */}
      <header className="bg-[#1B3A6B] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/demo" className="text-2xl font-bold tracking-tight">
            histori.
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/demo" className="text-lg hover:text-teal-200 transition-colors">ホーム</Link>
            <Link href="/demo/session" className="text-lg hover:text-teal-200 transition-colors">セッション</Link>
            <Link href="/demo/album/demo-album-001" className="text-lg hover:text-teal-200 transition-colors">アルバム</Link>
            <Link href="/demo/music" className="text-lg hover:text-teal-200 transition-colors">音楽</Link>
            <Link href="/demo/video" className="text-lg hover:text-teal-200 transition-colors">動画</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
