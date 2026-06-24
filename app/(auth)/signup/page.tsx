'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'family' | 'facility'>('family')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError || !data.user) {
      setError('登録に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, mode })

    if (profileError) {
      setError('プロフィールの作成に失敗しました。')
      setLoading(false)
      return
    }

    router.push('/setup')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1B3A6B] tracking-tight">histori.</h1>
          <p className="mt-2 text-xl text-gray-500">大切な人の記憶を、物語に。</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">新規登録</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-lg font-medium text-[#1F2937] mb-3">
                ご利用の形態
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'family', label: '家族・個人', desc: 'ご家族のケアに' },
                  { value: 'facility', label: '施設・専門職', desc: '介護施設・医療機関に' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value as 'family' | 'facility')}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                      mode === opt.value
                        ? 'border-[#0D9488] bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-lg">{opt.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-[#1F2937] mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-xl focus:outline-none focus:border-[#0D9488]"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-[#1F2937] mb-2">
                パスワード（8文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-xl focus:outline-none focus:border-[#0D9488]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#1B3A6B] text-white text-xl font-bold rounded-xl hover:bg-[#162d54] disabled:opacity-50 transition-colors"
            >
              {loading ? '登録中...' : '無料で始める'}
            </button>
          </form>

          <p className="mt-6 text-center text-lg text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-[#0D9488] font-medium hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
