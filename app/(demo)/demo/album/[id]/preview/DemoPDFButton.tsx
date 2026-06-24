'use client'

import dynamic from 'next/dynamic'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

// SSR を無効にしてクライアントのみでレンダリング
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="h-12 px-5 bg-gray-200 text-gray-400 text-base font-bold rounded-xl flex items-center">PDF準備中...</span> }
)

// AlbumPDF も SSR 対象外にするため動的インポート
import { AlbumPDF } from '@/lib/pdf/generator'

interface Props {
  album: Album
  pages: AlbumPage[]
  subject: Subject
}

export default function DemoPDFButton({ album, pages, subject }: Props) {
  return (
    <PDFDownloadLink
      document={<AlbumPDF album={album} pages={pages} subject={subject} />}
      fileName={`${album.title}.pdf`}
    >
      {({ loading }) => (
        <span className="h-12 px-5 bg-[#D97706] text-white text-base font-bold rounded-xl hover:bg-amber-600 flex items-center cursor-pointer">
          {loading ? 'PDF生成中...' : '📄 PDFダウンロード'}
        </span>
      )}
    </PDFDownloadLink>
  )
}
