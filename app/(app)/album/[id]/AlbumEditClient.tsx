'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MicButton from '@/components/MicButton'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'
import Link from 'next/link'

const TEMPLATES = [
  { id: 'standard',    label: '標準',     desc: '写真＋テキスト' },
  { id: 'large_photo', label: '写真大',   desc: '大きな写真メイン' },
  { id: 'text_only',   label: 'テキスト', desc: '文章のみ' },
  { id: 'grid',        label: 'グリッド', desc: '写真4枚並び' },
]

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

interface Props {
  album: Album
  pages: AlbumPage[]
  subject: Subject
  answers: Array<{ id: string; question_text: string; answer_text?: string; sessions?: { life_stage: string } | null }>
}

export default function AlbumEditClient({ album, pages: initialPages, subject, answers }: Props) {
  const [pages, setPages] = useState<AlbumPage[]>(initialPages)
  const [editing, setEditing] = useState<AlbumPage | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showAnswerPicker, setShowAnswerPicker] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function addPage() {
    setSaving(true)
    const newPageNum = pages.length + 1
    const { data, error } = await supabase
      .from('album_pages')
      .insert({ album_id: album.id, page_number: newPageNum, template: 'standard' })
      .select()
      .single()
    if (!error && data) {
      setPages((prev) => [...prev, data as AlbumPage])
      setEditing(data as AlbumPage)
    }
    setSaving(false)
  }

  async function savePage(page: AlbumPage) {
    setSaving(true)
    let photoUrls = page.photo_urls || []

    if (photoFile) {
      const path = `photos/${album.subject_id}/${Date.now()}_${photoFile.name}`
      const { data: uploadData } = await supabase.storage.from('media').upload(path, photoFile)
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
        photoUrls = [...photoUrls, publicUrl]
      }
      setPhotoFile(null)
    }

    const { data } = await supabase
      .from('album_pages')
      .update({ ...page, photo_urls: photoUrls })
      .eq('id', page.id)
      .select()
      .single()

    if (data) {
      setPages((prev) => prev.map((p) => (p.id === page.id ? (data as AlbumPage) : p)))
      setEditing(data as AlbumPage)
    }
    setSaving(false)
  }

  async function deletePage(pageId: string) {
    if (!confirm('このページを削除しますか？')) return
    await supabase.from('album_pages').delete().eq('id', pageId)
    setPages((prev) => prev.filter((p) => p.id !== pageId))
    if (editing?.id === pageId) setEditing(null)
  }

  async function togglePublish() {
    setPublishing(true)
    const token = album.share_token || Math.random().toString(36).slice(2)
    const { data } = await supabase
      .from('albums')
      .update({ is_published: !album.is_published, share_token: token })
      .eq('id', album.id)
      .select()
      .single()
    if (data) router.refresh()
    setPublishing(false)
  }

  function applyAnswer(answerText: string) {
    if (!editing) return
    setEditing({ ...editing, body_text: (editing.body_text ? editing.body_text + '\n\n' : '') + answerText })
    setShowAnswerPicker(false)
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/album" className="text-base text-[#0D9488] hover:underline">← アルバム一覧</Link>
          <h1 className="text-3xl font-bold text-[#1B3A6B] mt-1">{album.title}</h1>
          <p className="text-lg text-gray-500">{subject?.name} さん</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/album/${album.id}/preview`}
            className="h-12 px-5 bg-[#0D9488] text-white text-base font-bold rounded-xl hover:bg-teal-700 flex items-center"
          >
            👁 プレビュー
          </Link>
          <Link
            href={`/api/pdf?albumId=${album.id}`}
            target="_blank"
            className="h-12 px-5 bg-[#D97706] text-white text-base font-bold rounded-xl hover:bg-amber-600 flex items-center"
          >
            📄 PDF出力
          </Link>
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`h-12 px-5 text-base font-bold rounded-xl transition-colors ${
              album.is_published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {album.is_published ? '✓ 公開中' : '🔒 非公開'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ページ一覧（左） */}
        <div className="col-span-1 space-y-3">
          <h2 className="text-xl font-bold text-[#1F2937]">ページ一覧</h2>
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => setEditing(page)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                editing?.id === page.id ? 'border-[#0D9488] bg-teal-50' : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#1F2937]">
                  {page.page_number} ページ
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  削除
                </button>
              </div>
              {page.title && <p className="text-base text-gray-600 mt-1 truncate">{page.title}</p>}
              {page.life_stage && (
                <span className="text-sm text-[#0D9488]">{STAGE_LABELS[page.life_stage]}</span>
              )}
              {(page.photo_urls?.length ?? 0) > 0 && (
                <p className="text-sm text-gray-400">📷 {page.photo_urls!.length}枚</p>
              )}
            </div>
          ))}
          <button
            onClick={addPage}
            disabled={saving}
            className="w-full h-14 border-2 border-dashed border-gray-300 text-gray-500 text-lg font-medium rounded-xl hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
          >
            ＋ ページを追加
          </button>
        </div>

        {/* ページ編集（右） */}
        <div className="col-span-2">
          {editing ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-xl font-bold text-[#1F2937]">
                {editing.page_number} ページを編集
              </h2>

              {/* テンプレート選択 */}
              <div>
                <label className="block text-base font-medium mb-2">レイアウト</label>
                <div className="grid grid-cols-4 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditing({ ...editing, template: t.id as AlbumPage['template'] })}
                      className={`p-3 rounded-xl border-2 text-sm transition-colors ${
                        editing.template === t.id ? 'border-[#0D9488] bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">{t.label}</div>
                      <div className="text-gray-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ライフステージ */}
              <div>
                <label className="block text-base font-medium mb-2">ライフステージ（任意）</label>
                <select
                  value={editing.life_stage || ''}
                  onChange={(e) => setEditing({ ...editing, life_stage: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
                >
                  <option value="">選択しない</option>
                  {Object.entries(STAGE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-base font-medium mb-2">ページタイトル</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editing.title || ''}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
                    placeholder="例：故郷の思い出"
                  />
                  <MicButton onResult={(text) => setEditing({ ...editing, title: (editing.title || '') + text })} />
                </div>
              </div>

              {/* 本文 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-medium">本文（最大200文字）</label>
                  <button
                    onClick={() => setShowAnswerPicker(true)}
                    className="text-sm text-[#0D9488] hover:underline"
                  >
                    📝 セッション回答から挿入
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={editing.body_text || ''}
                    onChange={(e) => setEditing({ ...editing, body_text: e.target.value.slice(0, 200) })}
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488] resize-none pr-16"
                    placeholder="思い出のエピソードを入力してください"
                  />
                  <MicButton
                    onResult={(text) => setEditing({ ...editing, body_text: ((editing.body_text || '') + text).slice(0, 200) })}
                    className="absolute bottom-3 right-3"
                  />
                </div>
                <p className="text-sm text-gray-400 text-right">{(editing.body_text || '').length}/200</p>
              </div>

              {/* 写真アップロード */}
              {editing.template !== 'text_only' && (
                <div>
                  <label className="block text-base font-medium mb-2">写真を追加</label>
                  {(editing.photo_urls?.length ?? 0) > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {editing.photo_urls!.map((url, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                          <button
                            onClick={() => setEditing({
                              ...editing,
                              photo_urls: editing.photo_urls!.filter((_, idx) => idx !== i)
                            })}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base"
                  />
                  {photoFile && (
                    <p className="text-sm text-[#0D9488] mt-1">✓ {photoFile.name}</p>
                  )}
                </div>
              )}

              {/* 保存ボタン */}
              <button
                onClick={() => savePage(editing)}
                disabled={saving}
                className="w-full h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl disabled:opacity-50 hover:bg-[#162d54] transition-colors"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-xl text-gray-500">
                左のリストからページを選択するか、<br />「ページを追加」してください
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 回答ピッカーモーダル */}
      {showAnswerPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#1B3A6B]">セッション回答から挿入</h3>
              <button onClick={() => setShowAnswerPicker(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              {answers.filter((a) => a.answer_text).map((a) => (
                <button
                  key={a.id}
                  onClick={() => applyAnswer(a.answer_text!)}
                  className="w-full text-left p-4 border-2 border-gray-100 rounded-xl hover:border-[#0D9488] transition-colors"
                >
                  <p className="text-sm text-[#0D9488] font-medium mb-1">
                    {a.sessions?.life_stage ? STAGE_LABELS[a.sessions.life_stage] : ''}
                  </p>
                  <p className="text-base text-gray-600 font-medium">{a.question_text}</p>
                  <p className="text-base text-[#1F2937] mt-1">{a.answer_text}</p>
                </button>
              ))}
              {answers.filter((a) => a.answer_text).length === 0 && (
                <p className="text-lg text-gray-400 text-center py-8">セッションの回答がまだありません</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
