export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // ローカル開発用：認証バイパス（Supabase未接続時）
  let isAuthed = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAuthed = !!user
  } catch {}

  if (!isAuthed && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
    redirect('/login')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#1B3A6B] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
            histori.
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg hover:text-teal-200 transition-colors">
              ホーム
            </Link>
            <Link href="/session" className="text-lg hover:text-teal-200 transition-colors">
              セッション
            </Link>
            <Link href="/album" className="text-lg hover:text-teal-200 transition-colors">
              アルバム
            </Link>
            <Link href="/music" className="text-lg hover:text-teal-200 transition-colors">
              音楽
            </Link>
            <Link href="/video" className="text-lg hover:text-teal-200 transition-colors">
              動画
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-lg text-teal-200 hover:text-white transition-colors">
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
