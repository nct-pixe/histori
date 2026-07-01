'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MicButton from '@/components/MicButton'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'
import Link from 'next/link'

const TEMPLATES = [
  { id: 'standard',    label: '標準',   desc: '写真＋テキスト', icon: '📄' },
  { id: 'large_photo', label: '写真大', desc: '大きな写真メイン', icon: '🖼' },
  { id: 'text_only',   label: 'テキスト', desc: '文章のみ', icon: '📝' },
  { id: 'grid',        label: 'グリッド', desc: '写真4枚', icon: '⊞' },
]

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

const inputStyle = {
  border: '1.5px solid #E2E8F0', borderRadius: '12px',
  padding: '10px 14px', fontSize: '1rem', color: '#1F2937', outline: 'none', width: '100%',
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
  const [showPageList, setShowPageList] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  async function addPage() {
    setSaving(true)
    const newPageNum = pages.length + 1
    const { data, error } = await supabase
      .from('album_pages')
      .insert({ album_id: album.id, page_number: newPageNum, template: 'standard' })
      .select().single()
    if (!error && data) {
      setPages((prev) => [...prev, data as AlbumPage])
      setEditing(data as AlbumPage)
      setShowPageList(false)
    }
    setSaving(false)
  }

  async function savePage(page: AlbumPage) {
    setSaving(true)
    let photoUrls = page.photo_urls || []
    if (photoFile) {
      const path = `photos/${album.subject_id}/${Date.now()}_${photoFile.name}`
      const uploadForm = new FormData()
      uploadForm.append('file', photoFile)
      uploadForm.append('bucket', 'album-photos')
      uploadForm.append('path', path)
      const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      if (res.ok) {
        const { url } = await res.json()
        photoUrls = [...photoUrls, url]
      }
      setPhotoFile(null)
    }
    const { data } = await supabase.from('album_pages').update({ ...page, photo_urls: photoUrls }).eq('id', page.id).select().single()
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
    await supabase.from('albums').update({ is_published: !album.is_published, share_token: token }).eq('id', album.id)
    router.refresh()
    setPublishing(false)
  }

  function applyAnswer(answerText: string) {
    if (!editing) return
    setEditing({ ...editing, body_text: (editing.body_text ? editing.body_text + '\n\n' : '') + answerText })
    setShowAnswerPicker(false)
  }

  function selectPage(page: AlbumPage) {
    setEditing(page)
    setShowPageList(false)
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-5">
        <Link href="/album" className="text-sm font-medium hover:underline inline-flex items-center gap-1 mb-2" style={{ color: '#0D9488' }}>
          ← アルバム一覧
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold leading-tight truncate" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{album.title}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{subject?.name} さん</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/album/${album.id}/preview`}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-white hover:opacity-90"
              style={{ background: '#0D9488' }}>
              👁 プレビュー
            </Link>
            <Link href={`/api/pdf?albumId=${album.id}`} target="_blank"
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-white hover:opacity-90"
              style={{ background: '#D97706' }}>
              📄 PDF
            </Link>
            <button onClick={togglePublish} disabled={publishing}
              className="px-3 py-2 rounded-full text-xs font-bold"
              style={album.is_published ? { background: '#F0FDF4', color: '#16A34A' } : { background: '#F1F5F9', color: '#64748B' }}>
              {album.is_published ? '✓ 公開' : '🔒'}
            </button>
          </div>
        </div>
      </div>

      {/* モバイル: ページ一覧⇔編集の切り替えタブ */}
      <div className="md:hidden flex mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #E2E8F0', background: 'white' }}>
        <button onClick={() => setShowPageList(true)} className="flex-1 py-2.5 text-sm font-bold transition-colors"
          style={showPageList ? { background: '#1B3A6B', color: 'white' } : { color: '#64748B' }}>
          📑 ページ一覧
        </button>
        <button onClick={() => setShowPageList(false)} className="flex-1 py-2.5 text-sm font-bold transition-colors"
          style={!showPageList ? { background: '#1B3A6B', color: 'white' } : { color: '#64748B' }}>
          ✏️ 編集
        </button>
      </div>

      {/* PC: 2カラム / モバイル: タブ切り替え */}
      <div className="md:grid md:grid-cols-3 md:gap-6">
        {/* ページ一覧 */}
        <div className={`md:col-span-1 md:block ${showPageList ? 'block' : 'hidden'}`}>
          <h2 className="text-sm font-bold mb-3" style={{ color: '#64748B' }}>ページ一覧</h2>
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id} onClick={() => selectPage(page)}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  border: editing?.id === page.id ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
                  background: editing?.id === page.id ? '#F0FDF4' : 'white',
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: '#1B3A6B' }}>
                    {page.page_number}ページ
                    {page.life_stage && <span className="ml-2 text-xs font-normal" style={{ color: '#0D9488' }}>{STAGE_LABELS[page.life_stage]}</span>}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                    className="text-xs px-2 py-1 rounded-full hover:opacity-80"
                    style={{ background: '#FEF2F2', color: '#EF4444' }}>
                    削除
                  </button>
                </div>
                {page.title && <p className="text-sm mt-1 truncate" style={{ color: '#64748B' }}>{page.title}</p>}
                {(page.photo_urls?.length ?? 0) > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>📷 {page.photo_urls!.length}枚</p>
                )}
              </div>
            ))}
            <button onClick={addPage} disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1.5px dashed #CBD5E1', color: '#64748B', background: 'white' }}>
              ＋ ページを追加
            </button>
          </div>
        </div>

        {/* 編集エリア */}
        <div className={`md:col-span-2 md:block ${!showPageList ? 'block' : 'hidden'}`}>
          {editing ? (
            <div className="bg-white rounded-2xl p-5 space-y-5" style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="text-base font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
                {editing.page_number}ページを編集
              </h2>

              {/* レイアウト選択 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>レイアウト</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {TEMPLATES.map((t) => (
                    <button key={t.id}
                      onClick={() => setEditing({ ...editing, template: t.id as AlbumPage['template'] })}
                      className="p-3 rounded-xl text-sm transition-all text-left"
                      style={{
                        border: editing.template === t.id ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
                        background: editing.template === t.id ? '#F0FDF4' : 'white',
                      }}>
                      <div className="text-lg mb-1">{t.icon}</div>
                      <div className="font-bold text-sm" style={{ color: '#1B3A6B' }}>{t.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ライフステージ */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>ライフステージ（任意）</label>
                <select value={editing.life_stage || ''} onChange={(e) => setEditing({ ...editing, life_stage: e.target.value })}
                  style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="">選択しない</option>
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>ページタイトル</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.title || ''}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    style={inputStyle} placeholder="例：故郷の思い出"
                    onFocus={(e) => e.target.style.borderColor = '#0D9488'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                  <MicButton onResult={(text) => setEditing({ ...editing, title: (editing.title || '') + text })} />
                </div>
              </div>

              {/* 本文 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: '#374151' }}>本文（最大200文字）</label>
                  <button onClick={() => setShowAnswerPicker(true)}
                    className="text-xs font-medium hover:underline" style={{ color: '#0D9488' }}>
                    📝 回答から挿入
                  </button>
                </div>
                <div className="relative">
                  <textarea value={editing.body_text || ''}
                    onChange={(e) => setEditing({ ...editing, body_text: e.target.value.slice(0, 200) })}
                    rows={5} style={{ ...inputStyle, resize: 'none', paddingRight: '3.5rem' }}
                    placeholder="思い出のエピソードを入力してください"
                    onFocus={(e) => e.target.style.borderColor = '#0D9488'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                  <MicButton onResult={(text) => setEditing({ ...editing, body_text: ((editing.body_text || '') + text).slice(0, 200) })}
                    className="absolute bottom-3 right-3" />
                </div>
                <p className="text-xs text-right mt-1" style={{ color: '#94A3B8' }}>{(editing.body_text || '').length}/200</p>
              </div>

              {/* 写真 */}
              {editing.template !== 'text_only' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>写真を追加</label>
                  {(editing.photo_urls?.length ?? 0) > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {editing.photo_urls!.map((url, i) => (
                        <div key={i} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl" />
                          <button onClick={() => setEditing({ ...editing, photo_urls: editing.photo_urls!.filter((_, idx) => idx !== i) })}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
                            style={{ background: '#EF4444' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm rounded-xl px-4 py-2.5" style={{ border: '1.5px solid #E2E8F0', color: '#64748B' }} />
                  {photoFile && <p className="text-xs mt-1" style={{ color: '#0D9488' }}>✓ {photoFile.name}</p>}
                </div>
              )}

              {/* 写真キャプション */}
              {editing.template !== 'text_only' && (editing.photo_urls?.length ?? 0) > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>写真のキャプション</label>
                  <input type="text" value={editing.photo_caption || ''}
                    onChange={(e) => setEditing({ ...editing, photo_caption: e.target.value.slice(0, 60) })}
                    placeholder="例：自宅、家族旅行にて"
                    style={inputStyle} />
                </div>
              )}

              {/* 保存 */}
              <button onClick={() => savePage(editing)} disabled={saving}
                className="w-full py-3.5 rounded-full text-base font-bold text-white disabled:opacity-50 hover:opacity-90"
                style={{ background: '#1B3A6B' }}>
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #E2E8F0' }}>
              <div className="text-4xl mb-4">📄</div>
              <p className="text-base" style={{ color: '#64748B' }}>
                ページ一覧からページを選択するか、<br />「ページを追加」してください
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 回答ピッカーモーダル */}
      {showAnswerPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>回答から挿入</h3>
              <button onClick={() => setShowAnswerPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                style={{ background: '#F1F5F9', color: '#64748B' }}>×</button>
            </div>
            <div className="space-y-3">
              {answers.filter((a) => a.answer_text).map((a) => (
                <button key={a.id} onClick={() => applyAnswer(a.answer_text!)}
                  className="w-full text-left p-4 rounded-xl transition-all hover:shadow-sm"
                  style={{ border: '1.5px solid #E2E8F0' }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0D9488')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}>
                  {a.sessions?.life_stage && (
                    <p className="text-xs font-semibold mb-1" style={{ color: '#0D9488' }}>{STAGE_LABELS[a.sessions.life_stage]}</p>
                  )}
                  <p className="text-sm font-medium" style={{ color: '#374151' }}>{a.question_text}</p>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: '#64748B' }}>{a.answer_text}</p>
                </button>
              ))}
              {answers.filter((a) => a.answer_text).length === 0 && (
                <p className="text-base text-center py-8" style={{ color: '#94A3B8' }}>セッションの回答がまだありません</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
