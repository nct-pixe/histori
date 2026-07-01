export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, UserPlus, MessageCircle, BookOpen, Video, LogOut } from 'lucide-react'

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

  const navItems = [
    { href: '/dashboard', label: 'ホーム',     Icon: Home },
    { href: '/setup',     label: '登録',       Icon: UserPlus },
    { href: '/session',   label: 'セッション', Icon: MessageCircle },
    { href: '/album',     label: 'アルバム',   Icon: BookOpen },
    { href: '/video',     label: '動画',       Icon: Video },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F0F4F8' }}>
      {/* PC ヘッダー */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }} className="shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight flex-shrink-0" style={{ color: '#0D9488', fontFamily: 'serif' }}>
            histori.
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors hover:bg-teal-50 whitespace-nowrap"
                style={{ color: '#1B3A6B' }}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <form action={signOut}>
              <button type="submit"
                className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-full text-sm font-medium transition-colors hover:bg-slate-50 whitespace-nowrap"
                style={{ color: '#94A3B8' }}>
                <LogOut size={15} />
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">{children}</main>

      {/* スマホ ボトムナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ background: 'white', borderTop: '1px solid #E2E8F0' }}>
        {navItems.map(({ href, label, Icon }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl"
            style={{ color: '#1B3A6B', minWidth: 0 }}>
            <Icon size={22} strokeWidth={1.8} />
            <span className="font-medium whitespace-nowrap" style={{ fontSize: '10px' }}>{label}</span>
          </Link>
        ))}
        <form action={signOut}>
          <button type="submit" className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl" style={{ color: '#94A3B8' }}>
            <LogOut size={22} strokeWidth={1.8} />
            <span className="font-medium" style={{ fontSize: '10px' }}>ログアウト</span>
          </button>
        </form>
      </nav>
    </div>
  )
}
