'use client'

import dynamic from 'next/dynamic'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'
import { AlbumPDF, SinglePagePDF } from '@/lib/pdf/generator'

// SSR 無効で PDFDownloadLink を読み込む
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className="h-12 px-5 bg-gray-200 text-gray-400 text-base font-bold rounded-xl flex items-center">
        PDF準備中...
      </span>
    ),
  }
)

// ── アルバム全体ダウンロードボタン ──────────────────────────────
interface AlbumProps {
  album: Album
  pages: AlbumPage[]
  subject: Subject
}

export default function DemoPDFButton({ album, pages, subject }: AlbumProps) {
  return (
    <PDFDownloadLink
      document={<AlbumPDF album={album} pages={pages} subject={subject} />}
      fileName={`${album.title}.pdf`}
    >
      {({ loading }) => (
        <span className="h-12 px-5 bg-[#D97706] text-white text-base font-bold rounded-xl hover:bg-amber-600 flex items-center cursor-pointer">
          {loading ? 'PDF生成中...' : '📄 PDFダウンロード（全ページ）'}
        </span>
      )}
    </PDFDownloadLink>
  )
}

// ── 1ページ単体印刷ボタン ──────────────────────────────────────
interface SingleProps {
  page: AlbumPage
  album: Album
  subject: Subject
}

export function DemoSinglePagePDFButton({ page, album, subject }: SingleProps) {
  const label = page.title || `p${page.page_number}`
  return (
    <PDFDownloadLink
      document={<SinglePagePDF page={page} album={album} subject={subject} />}
      fileName={`${album.title}_${label}.pdf`}
    >
      {({ loading }) => (
        <span className="h-8 px-3 bg-[#1B3A6B] text-white text-xs font-bold rounded-lg hover:bg-[#162d54] flex items-center gap-1 cursor-pointer">
          {loading ? '生成中...' : '🖨 このページをA4印刷'}
        </span>
      )}
    </PDFDownloadLink>
  )
}
