'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DEMO_ALBUM, DEMO_PAGES, DEMO_SUBJECT, DEMO_ANSWERS } from '@/lib/demo/mockData'
import type { AlbumPage } from '@/lib/supabase/types'

const TEMPLATES = [
  { id: 'standard',    label: '標準' },
  { id: 'large_photo', label: '写真大' },
  { id: 'text_only',   label: 'テキスト' },
  { id: 'grid',        label: 'グリッド' },
]

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

export default function DemoAlbumPage() {
  const [pages, setPages] = useState<AlbumPage[]>(DEMO_PAGES)
  const [editing, setEditing] = useState<AlbumPage | null>(null)
  const [showAnswerPicker, setShowAnswerPicker] = useState(false)

  function addPage() {
    const newPage: AlbumPage = {
      id: `demo-page-${Date.now()}`,
      album_id: DEMO_ALBUM.id,
      page_number: pages.length + 1,
      template: 'standard',
      title: '',
      body_text: '',
      photo_urls: [],
      created_at: new Date().toISOString(),
    }
    setPages((prev) => [...prev, newPage])
    setEditing(newPage)
  }

  function savePage(page: AlbumPage) {
    setPages((prev) => prev.map((p) => (p.id === page.id ? page : p)))
    setEditing(page)
  }

  function deletePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/demo" className="text-base text-[#0D9488] hover:underline">← ホーム</Link>
          <h1 className="text-3xl font-bold text-[#1B3A6B] mt-1">{DEMO_ALBUM.title}</h1>
          <p className="text-lg text-gray-500">{DEMO_SUBJECT.name} さん</p>
        </div>
        <div className="flex gap-3">
          <Link href="/demo/album/demo-album-001/preview"
            className="h-12 px-5 bg-[#0D9488] text-white text-base font-bold rounded-xl hover:bg-teal-700 flex items-center">
            👁 プレビュー
          </Link>
          <span className="h-12 px-5 bg-gray-100 text-gray-400 text-base font-bold rounded-xl flex items-center">
            📄 PDF（要Supabase）
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ページ一覧 */}
        <div className="col-span-1 space-y-3">
          <h2 className="text-xl font-bold text-[#1F2937]">ページ一覧</h2>
          {pages.map((page) => (
            <div key={page.id} onClick={() => setEditing(page)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                editing?.id === page.id ? 'border-[#0D9488] bg-teal-50' : 'border-gray-100 bg-white hover:border-gray-300'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{page.page_number} ページ</span>
                <button onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                  className="text-red-400 hover:text-red-600 text-sm">削除</button>
              </div>
              {page.title && <p className="text-base text-gray-600 truncate">{page.title}</p>}
              {page.life_stage && <span className="text-sm text-[#0D9488]">{STAGE_LABELS[page.life_stage]}</span>}
            </div>
          ))}
          <button onClick={addPage}
            className="w-full h-14 border-2 border-dashed border-gray-300 text-gray-500 text-lg font-medium rounded-xl hover:border-[#0D9488] hover:text-[#0D9488] transition-colors">
            ＋ ページを追加
          </button>
        </div>

        {/* 編集エリア */}
        <div className="col-span-2">
          {editing ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-xl font-bold">{editing.page_number} ページを編集</h2>

              {/* テンプレート */}
              <div>
                <label className="block text-base font-medium mb-2">レイアウト</label>
                <div className="grid grid-cols-4 gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setEditing({ ...editing, template: t.id as AlbumPage['template'] })}
                      className={`p-3 rounded-xl border-2 text-sm transition-colors ${
                        editing.template === t.id ? 'border-[#0D9488] bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ライフステージ */}
              <div>
                <label className="block text-base font-medium mb-2">ライフステージ</label>
                <select value={editing.life_stage || ''}
                  onChange={(e) => setEditing({ ...editing, life_stage: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]">
                  <option value="">選択しない</option>
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-base font-medium mb-2">ページタイトル</label>
                <input type="text" value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
                  placeholder="例：故郷の思い出" />
              </div>

              {/* 本文 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-medium">本文</label>
                  <button onClick={() => setShowAnswerPicker(true)}
                    className="text-sm text-[#0D9488] hover:underline">📝 回答から挿入</button>
                </div>
                <textarea value={editing.body_text || ''}
                  onChange={(e) => setEditing({ ...editing, body_text: e.target.value.slice(0, 200) })}
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488] resize-none"
                  placeholder="思い出のエピソード（最大200文字）" />
                <p className="text-sm text-gray-400 text-right">{(editing.body_text || '').length}/200</p>
              </div>

              <button onClick={() => savePage(editing)}
                className="w-full h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
                保存する
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-xl text-gray-500">ページを選択するか「ページを追加」してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 回答ピッカー */}
      {showAnswerPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1B3A6B]">回答から挿入</h3>
              <button onClick={() => setShowAnswerPicker(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              {DEMO_ANSWERS.map((a) => (
                <button key={a.id} onClick={() => {
                  if (editing) {
                    setEditing({ ...editing, body_text: ((editing.body_text || '') + (editing.body_text ? '\n\n' : '') + a.answer_text!).slice(0, 200) })
                    setShowAnswerPicker(false)
                  }
                }} className="w-full text-left p-4 border-2 border-gray-100 rounded-xl hover:border-[#0D9488] transition-colors">
                  <p className="text-sm text-[#0D9488] font-medium mb-1">{STAGE_LABELS[a.sessions.life_stage] || ''}</p>
                  <p className="text-base text-gray-600 font-medium">{a.question_text}</p>
                  <p className="text-base text-[#1F2937] mt-1">{a.answer_text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
