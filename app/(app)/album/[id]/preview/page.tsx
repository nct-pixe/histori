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
        <Link href={`/album/${id}`} className="text-base text-[#0D9488] hover:underline">
          ← 編集に戻る
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/api/pdf?albumId=${id}`}
            target="_blank"
            className="h-12 px-5 bg-[#D97706] text-white text-base font-bold rounded-xl hover:bg-amber-600 flex items-center"
          >
            📄 PDFダウンロード
          </Link>
        </div>
      </div>

      {/* 表紙 */}
      <div className="bg-[#1B3A6B] text-white rounded-2xl p-12 text-center mb-6 shadow-lg">
        <div className="text-6xl mb-4">📔</div>
        <h1 className="text-4xl font-bold mb-4">{(album as Album).title}</h1>
        <p className="text-2xl text-teal-200">{(subject as Subject)?.name} さんの記憶</p>
        {(subject as Subject)?.birth_year && (
          <p className="text-xl text-teal-300 mt-2">{(subject as Subject).birth_year}年生まれ</p>
        )}
        <p className="text-base text-teal-400 mt-6">
          作成日：{new Date((album as Album).created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      {/* 各ページ */}
      {(pages as AlbumPage[])?.map((page) => (
        <div key={page.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* ページヘッダー */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#1B3A6B]">{page.page_number}</span>
              {page.life_stage && (
                <span className="px-3 py-1 bg-teal-50 text-[#0D9488] text-sm rounded-full font-medium">
                  {STAGE_LABELS[page.life_stage]}
                </span>
              )}
            </div>
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
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between text-sm text-gray-400">
            <span>{(subject as Subject)?.name} さんのアルバム</span>
            <span>— {page.page_number} —</span>
          </div>
        </div>
      ))}

      {/* 奥付 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
        <p className="text-xl font-bold text-[#1F2937] mb-2">{(album as Album).title}</p>
        <p className="text-base">制作：histori. デジタル回想法プラットフォーム</p>
        <p className="text-base mt-1">完成日：{new Date().toLocaleDateString('ja-JP')}</p>
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
    <div className="grid grid-cols-2 gap-6">
      <div>
        {page.title && <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{page.title}</h2>}
        {page.body_text && <p className="text-xl text-[#1F2937] leading-relaxed">{page.body_text}</p>}
      </div>
      <div className="space-y-3">
        {(page.photo_urls?.length ?? 0) > 0 ? (
          page.photo_urls!.slice(0, 1).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-full rounded-xl object-cover aspect-square" />
          ))
        ) : (
          <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">
            🖼
          </div>
        )}
      </div>
    </div>
  )
}

function LargePhotoLayout({ page }: { page: AlbumPage }) {
  return (
    <div className="relative">
      {(page.photo_urls?.length ?? 0) > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={page.photo_urls![0]} alt="" className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-6xl">🖼</div>
      )}
      <div className="p-6">
        {page.title && <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">{page.title}</h2>}
        {page.body_text && <p className="text-xl text-[#1F2937] leading-relaxed">{page.body_text}</p>}
      </div>
    </div>
  )
}

function TextOnlyLayout({ page }: { page: AlbumPage }) {
  return (
    <div className="max-w-xl mx-auto py-4">
      {page.title && <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6 text-center">{page.title}</h2>}
      {page.body_text && <p className="text-xl text-[#1F2937] leading-relaxed">{page.body_text}</p>}
    </div>
  )
}

function GridLayout({ page }: { page: AlbumPage }) {
  const photos = page.photo_urls || []
  const slots = Array.from({ length: 4 }, (_, i) => photos[i] || null)
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {slots.map((url, i) =>
          url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
          ) : (
            <div key={i} className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-3xl">🖼</div>
          )
        )}
      </div>
      {page.title && <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">{page.title}</h2>}
      {page.body_text && <p className="text-lg text-[#1F2937] leading-relaxed">{page.body_text}</p>}
    </div>
  )
}
