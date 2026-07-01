'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen w-screen flex" style={{ background: '#F0F4F8' }}>
      {/* 左：ビジュアル */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: '#F8F9FB' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/top-hero-histori.png"
          alt="histori ヒーロービジュアル"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 右：ログインフォーム */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-4xl font-bold" style={{ color: '#0D9488', fontFamily: 'serif' }}>histori.</h1>
            <p className="mt-2 text-base" style={{ color: '#64748B' }}>大切な人の記憶を、物語に。</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>ログイン</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>アカウントにサインインしてください</p>

            {error && (
              <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all"
                  style={{ border: '1.5px solid #E2E8F0', color: '#1F2937' }}
                  onFocus={(e) => e.target.style.borderColor = '#0D9488'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  パスワード
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all"
                  style={{ border: '1.5px solid #E2E8F0', color: '#1F2937' }}
                  onFocus={(e) => e.target.style.borderColor = '#0D9488'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#1B3A6B' }}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #F1F5F9' }}>
              <p className="text-sm" style={{ color: '#64748B' }}>
                アカウントをお持ちでない方は{' '}
                <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#0D9488' }}>
                  新規登録
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
