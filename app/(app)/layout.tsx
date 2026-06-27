export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F0F4F8' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }} className="shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight" style={{ color: '#0D9488' }}>
            histori.
          </Link>
          <nav className="flex items-center gap-2">
            {[
              { href: '/dashboard', label: 'ダッシュボード' },
              { href: '/setup', label: '対象者登録' },
              { href: '/session', label: 'セッション' },
              { href: '/album', label: 'アルバム' },
              { href: '/music', label: '音楽' },
              { href: '/video', label: '動画' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-full text-base font-medium transition-colors hover:bg-teal-50"
                style={{ color: '#1B3A6B' }}
              >
                {label}
              </Link>
            ))}
            <form action={signOut}>
              <button
                type="submit"
                className="ml-2 px-4 py-2 rounded-full text-base font-medium transition-colors"
                style={{ color: '#64748B' }}
              >
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
