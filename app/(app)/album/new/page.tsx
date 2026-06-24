'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NewAlbumPage() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectId = searchParams.get('subjectId')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!subjectId) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('albums')
      .insert({ subject_id: subjectId, title })
      .select()
      .single()
    if (!error && data) {
      router.push(`/album/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-8">新しいアルバムを作成</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">アルバムのタイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-xl focus:outline-none focus:border-[#0D9488]"
              placeholder="例：田中花子さんの思い出アルバム"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-14 border-2 border-gray-300 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl disabled:opacity-50 hover:bg-[#162d54]"
            >
              {loading ? '作成中...' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
