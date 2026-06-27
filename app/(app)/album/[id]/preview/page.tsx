import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

export default async function AlbumPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: album } = await supabase.from('albums').select('*').eq('id', id).single()
  if (!album) redirect('/album')

  const { data: pages } = await supabase
    .from('album_pages')
    .select('*')
    .eq('album_id', id)
    .order('page_number')

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', (album as Album).subject_id)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/album/${id}`} className="text-sm font-medium hover:underline" style={{ color: '#0D9488' }}>
          ← 編集に戻る
        </Link>
        <Link href={`/api/pdf?albumId=${id}`} target="_blank"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white hover:opacity-90"
          style={{ background: '#D97706' }}>
          📄 PDFダウンロード
        </Link>
      </div>

      {/* 表紙 */}
      <div className="text-white rounded-2xl p-12 text-center mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0D9488 100%)' }}>
        <div className="text-6xl mb-4">📔</div>
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'serif' }}>{(album as Album).title}</h1>
        <p className="text-2xl" style={{ color: '#99F6E4' }}>{(subject as Subject)?.name} さんの記憶</p>
        {(subject as Subject)?.birth_year && (
          <p className="text-xl mt-2" style={{ color: '#5EEAD4' }}>{(subject as Subject).birth_year}年生まれ</p>
        )}
        <p className="text-sm mt-6" style={{ color: '#A7F3D0' }}>
          作成日：{new Date((album as Album).created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      {/* 各ページ */}
      {(pages as AlbumPage[])?.map((page) => (
        <div key={page.id} className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
          {/* ページヘッダー */}
          <div className="px-6 py-3 flex items-center justify-between" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: '#1B3A6B' }}>PAGE {page.page_number}</span>
              {page.life_stage && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#F0FDF4', color: '#0D9488' }}>
                  {STAGE_LABELS[page.life_stage]}
                </span>
              )}
            </div>
            <Link href={`/api/pdf?albumId=${id}&pageId=${page.id}`} target="_blank"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white hover:opacity-90"
              style={{ background: '#1B3A6B' }}>
              🖨 A4印刷
            </Link>
          </div>

          <div className={`p-6 ${page.template === 'large_photo' ? 'p-0' : ''}`}>
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
          <div className="px-6 py-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #E2E8F0', color: '#94A3B8' }}>
            <span>{(subject as Subject)?.name} さんのアルバム</span>
            <span>— {page.page_number} —</span>
          </div>
        </div>
      ))}

      {/* 奥付 */}
      <div className="rounded-2xl p-8 text-center" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <p className="text-lg font-bold mb-2" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{(album as Album).title}</p>
        <p className="text-sm" style={{ color: '#64748B' }}>制作：histori. デジタル回想法プラットフォーム</p>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>完成日：{new Date().toLocaleDateString('ja-JP')}</p>
        {(subject as Subject)?.consent_agreed_at && (
          <p className="text-sm text-gray-400 mt-2">
            同意取得日：{new Date((subject as Subject).consent_agreed_at!).toLocaleDateString('ja-JP')}
          </p>
        )}
      </div>
    </div>
  )
}

function StandardLayout({ page }: { page: AlbumPage }) {
  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <div>
        {page.title && <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{page.title}</h2>}
        {page.body_text && <p className="text-base leading-relaxed" style={{ color: '#374151' }}>{page.body_text}</p>}
      </div>
      <div>
        {(page.photo_urls?.length ?? 0) > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.photo_urls![0]} alt="" className="w-full rounded-xl object-cover aspect-square" />
        ) : (
          <div className="w-full aspect-square rounded-xl flex items-center justify-center text-4xl" style={{ background: '#F1F5F9', color: '#CBD5E1' }}>🖼</div>
        )}
      </div>
    </div>
  )
}

function LargePhotoLayout({ page }: { page: AlbumPage }) {
  return (
    <div>
      {(page.photo_urls?.length ?? 0) > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={page.photo_urls![0]} alt="" className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-6xl" style={{ background: '#F1F5F9', color: '#CBD5E1' }}>🖼</div>
      )}
      <div className="p-6">
        {page.title && <h2 className="text-2xl font-bold mb-3" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{page.title}</h2>}
        {page.body_text && <p className="text-base leading-relaxed" style={{ color: '#374151' }}>{page.body_text}</p>}
      </div>
    </div>
  )
}

function TextOnlyLayout({ page }: { page: AlbumPage }) {
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      {page.title && <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{page.title}</h2>}
      {page.body_text && <p className="text-base leading-relaxed" style={{ color: '#374151' }}>{page.body_text}</p>}
    </div>
  )
}

function GridLayout({ page }: { page: AlbumPage }) {
  const photos = page.photo_urls || []
  const slots = Array.from({ length: 4 }, (_, i) => photos[i] || null)
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3 mb-5">
        {slots.map((url, i) =>
          url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
          ) : (
            <div key={i} className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl" style={{ background: '#F1F5F9', color: '#CBD5E1' }}>🖼</div>
          )
        )}
      </div>
      {page.title && <h2 className="text-xl font-bold mb-2" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{page.title}</h2>}
      {page.body_text && <p className="text-base leading-relaxed" style={{ color: '#374151' }}>{page.body_text}</p>}
    </div>
  )
}
