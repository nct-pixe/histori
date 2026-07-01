'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Maximize2, Minimize2 } from 'lucide-react'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

interface Props {
  id: string
  album: Album
  pages: AlbumPage[]
  subject: Subject | null
}

export default function AlbumPreviewClient({ id, album, pages, subject }: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  function toggleFullscreen() {
    const next = !fullscreen
    setFullscreen(next)
    const action = next ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.()
    action?.catch(() => {})
  }

  return (
    <div
      className={fullscreen
        ? 'fixed inset-0 z-50 overflow-y-auto px-4 py-6 md:px-10'
        : 'max-w-3xl mx-auto'}
      style={fullscreen ? { background: '#F0F4F8' } : undefined}
    >
      <div className={fullscreen ? 'max-w-4xl mx-auto' : ''}>
        <div className="flex items-center justify-between mb-8 gap-3">
          {fullscreen ? (
            <span className="text-sm font-medium" style={{ color: '#64748B' }}>{album.title}</span>
          ) : (
            <Link href={`/album/${id}`} className="text-sm font-medium hover:underline" style={{ color: '#0D9488' }}>
              ← 編集に戻る
            </Link>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-90"
              style={{ background: '#1B3A6B' }}
            >
              {fullscreen ? <Minimize2 size={16} strokeWidth={2} /> : <Maximize2 size={16} strokeWidth={2} />}
              {fullscreen ? '閉じる' : '全画面で見る'}
            </button>
            {!fullscreen && (
              <Link href={`/api/pdf?albumId=${id}`} target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-90"
                style={{ background: '#D97706' }}>
                PDFダウンロード
              </Link>
            )}
          </div>
        </div>

        {/* 表紙 */}
        <div className="text-white rounded-2xl p-6 text-center mb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0D9488 100%)' }}>
          <BookOpen size={28} strokeWidth={1.8} className="mx-auto mb-2" style={{ color: '#99F6E4' }} />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'serif' }}>{album.title}</h1>
          <p className="text-sm" style={{ color: '#99F6E4' }}>{subject?.name} さんの記憶</p>
          {subject?.birth_year && (
            <p className="text-xs mt-1" style={{ color: '#5EEAD4' }}>{subject.birth_year}年生まれ</p>
          )}
          <p className="text-xs mt-3" style={{ color: '#A7F3D0' }}>
            作成日：{new Date(album.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* 各ページ */}
        {pages?.map((page) => (
          <div key={page.id} className="rounded-2xl shadow-sm mb-6 overflow-hidden relative" style={{ background: '#FFFDF6', border: '1px solid #EDE4CC' }}>
            {/* ページヘッダー */}
            <div className="px-6 py-3 flex items-center justify-between" style={{ borderBottom: '1px dashed #E0D6B8' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: '#1B3A6B' }}>PAGE {page.page_number}</span>
                {page.life_stage && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#F0FDF4', color: '#0D9488' }}>
                    {STAGE_LABELS[page.life_stage]}
                  </span>
                )}
              </div>
              {!fullscreen && (
                <Link href={`/api/pdf?albumId=${id}&pageId=${page.id}`} target="_blank"
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white hover:opacity-90"
                  style={{ background: '#1B3A6B' }}>
                  A4印刷
                </Link>
              )}
            </div>

            <div className="p-6">
              {page.template === 'text_only' ? (
                <TextOnlyLayout page={page} />
              ) : page.template === 'large_photo' ? (
                <LargePhotoLayout page={page} />
              ) : page.template === 'grid' ? (
                <GridLayout page={page} />
              ) : (
                <StandardLayout page={page} />
              )}
            </div>

            {/* フッター */}
            <div className="px-6 py-3 flex items-center justify-between text-xs" style={{ borderTop: '1px dashed #E0D6B8', color: '#B3A780' }}>
              <span>{subject?.name} さんのアルバム</span>
              <span>— {page.page_number} —</span>
            </div>
          </div>
        ))}

        {/* 奥付 */}
        <div className="rounded-2xl p-8 text-center" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <p className="text-lg font-bold mb-2" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{album.title}</p>
          <p className="text-sm" style={{ color: '#64748B' }}>制作：histori. デジタル回想法プラットフォーム</p>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>完成日：{new Date().toLocaleDateString('ja-JP')}</p>
          {subject?.consent_agreed_at && (
            <p className="text-sm text-gray-400 mt-2">
              同意取得日：{new Date(subject.consent_agreed_at).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const handwriting = { fontFamily: "'Klee One', sans-serif" }

function PageCaption({ page }: { page: AlbumPage }) {
  if (!page.photo_caption) return null
  return (
    <p className="text-xs mt-2 mb-4" style={{ color: '#A39B7D', ...handwriting }}>
      写真：{page.photo_caption}
    </p>
  )
}

function PageTitleAndBody({ page }: { page: AlbumPage }) {
  return (
    <>
      {page.title && (
        <h2 className="text-2xl font-bold mb-3 pb-2" style={{ color: '#1B3A6B', ...handwriting, borderTop: '1px dashed #D9CDA0' }}>
          <span className="block pt-3">{page.title}</span>
        </h2>
      )}
      {page.body_text && (
        <p className="text-lg leading-loose whitespace-pre-wrap" style={{ color: '#44403C', ...handwriting }}>
          {page.body_text}
        </p>
      )}
    </>
  )
}

function StandardLayout({ page }: { page: AlbumPage }) {
  return (
    <div>
      {(page.photo_urls?.length ?? 0) > 0 ? (
        <div className="w-full rounded-sm p-3 shadow-sm mx-auto" style={{ background: 'white', maxWidth: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.photo_urls![0]} alt="" className="w-full aspect-[4/3] object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-sm flex items-center justify-center text-4xl mx-auto" style={{ background: '#F1F5F9', color: '#CBD5E1', maxWidth: 420 }}>🖼</div>
      )}
      <PageCaption page={page} />
      <PageTitleAndBody page={page} />
    </div>
  )
}

function LargePhotoLayout({ page }: { page: AlbumPage }) {
  return (
    <div>
      {(page.photo_urls?.length ?? 0) > 0 ? (
        <div className="w-full p-3 shadow-sm" style={{ background: 'white' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.photo_urls![0]} alt="" className="w-full aspect-video object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-6xl" style={{ background: '#F1F5F9', color: '#CBD5E1' }}>🖼</div>
      )}
      <PageCaption page={page} />
      <PageTitleAndBody page={page} />
    </div>
  )
}

function TextOnlyLayout({ page }: { page: AlbumPage }) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <PageTitleAndBody page={page} />
    </div>
  )
}

function GridLayout({ page }: { page: AlbumPage }) {
  const photos = (page.photo_urls || []).slice(0, 2)
  const isSingle = photos.length === 1
  return (
    <div>
      <div className={isSingle ? '' : 'grid grid-cols-2 gap-3'}>
        {photos.length > 0 ? (
          photos.map((url, i) => (
            <div key={i} className="p-3 shadow-sm" style={{ background: 'white' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className={`w-full object-cover ${isSingle ? 'aspect-video' : 'aspect-square'}`} />
            </div>
          ))
        ) : (
          <div className="w-full aspect-video rounded-sm flex items-center justify-center text-3xl" style={{ background: '#F1F5F9', color: '#CBD5E1' }}>🖼</div>
        )}
      </div>
      <PageCaption page={page} />
      <PageTitleAndBody page={page} />
    </div>
  )
}
