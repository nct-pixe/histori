import Link from 'next/link'
import { DEMO_ALBUM, DEMO_PAGES, DEMO_SUBJECT } from '@/lib/demo/mockData'
import DemoPDFButton, { DemoSinglePagePDFButton } from './DemoPDFButton'

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

export default function DemoAlbumPreview() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/demo/album/demo-album-001" className="text-base text-[#0D9488] hover:underline">
          ← 編集に戻る
        </Link>
        <DemoPDFButton album={DEMO_ALBUM} pages={DEMO_PAGES} subject={DEMO_SUBJECT} />
      </div>

      {/* 表紙 */}
      <div className="bg-[#1B3A6B] text-white rounded-2xl p-12 text-center mb-6 shadow-lg">
        <div className="text-6xl mb-4">📔</div>
        <h1 className="text-4xl font-bold mb-4">{DEMO_ALBUM.title}</h1>
        <p className="text-2xl text-teal-200">{DEMO_SUBJECT.name} さんの記憶</p>
        <p className="text-xl text-teal-300 mt-2">{DEMO_SUBJECT.birth_year}年生まれ　{DEMO_SUBJECT.birth_region}</p>
        <p className="text-base text-teal-400 mt-6">
          作成日：{new Date(DEMO_ALBUM.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      {/* ページ */}
      {DEMO_PAGES.map((page) => (
        <div key={page.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#1B3A6B]">{page.page_number}</span>
              {page.life_stage && (
                <span className="px-3 py-1 bg-teal-50 text-[#0D9488] text-sm rounded-full font-medium">
                  {STAGE_LABELS[page.life_stage]}
                </span>
              )}
            </div>
            <DemoSinglePagePDFButton page={page} album={DEMO_ALBUM} subject={DEMO_SUBJECT} />
          </div>
          <div className="p-6">
            {page.title && <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{page.title}</h2>}
            {page.body_text && <p className="text-xl text-[#1F2937] leading-relaxed">{page.body_text}</p>}
            {(!page.photo_urls || page.photo_urls.length === 0) && page.template !== 'text_only' && (
              <div className="mt-4 w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">
                🖼 写真エリア
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between text-sm text-gray-400">
            <span>{DEMO_SUBJECT.name} さんのアルバム</span>
            <span>— {page.page_number} —</span>
          </div>
        </div>
      ))}

      {/* 奥付 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
        <p className="text-xl font-bold text-[#1F2937] mb-2">{DEMO_ALBUM.title}</p>
        <p className="text-base">制作：histori. デジタル回想法プラットフォーム</p>
        <p className="text-base mt-1">完成日：{new Date().toLocaleDateString('ja-JP')}</p>
      </div>
    </div>
  )
}
