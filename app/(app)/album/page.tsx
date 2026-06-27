import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject, Album } from '@/lib/supabase/types'

export default async function AlbumListPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { subjectId } = await searchParams
  const supabase = await createClient()

  const { data: subjects } = await supabase.from('subjects').select('*').order('created_at', { ascending: false })
  const selectedSubject = subjectId
    ? (subjects as Subject[])?.find((s) => s.id === subjectId)
    : (subjects as Subject[])?.[0]

  const { data: albums } = selectedSubject
    ? await supabase.from('albums').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>ALBUM</p>
          <h1 className="text-4xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>アルバム</h1>
          {selectedSubject && (
            <p className="text-base mt-1" style={{ color: '#64748B' }}>{selectedSubject.name} さんの思い出アルバム</p>
          )}
        </div>
        {selectedSubject && (
          <Link
            href={`/album/new?subjectId=${selectedSubject.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: '#0D9488' }}
          >
            ＋ 新しいアルバム
          </Link>
        )}
      </div>

      {/* 主人公切替 */}
      {subjects && subjects.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 flex gap-2 flex-wrap" style={{ border: '1px solid #E2E8F0' }}>
          {(subjects as Subject[]).map((s) => (
            <Link key={s.id} href={`/album?subjectId=${s.id}`}
              className="px-5 py-2.5 rounded-full text-base font-medium transition-colors"
              style={s.id === selectedSubject?.id
                ? { background: '#1B3A6B', color: 'white' }
                : { background: '#F1F5F9', color: '#475569' }}>
              {s.name} さん
            </Link>
          ))}
        </div>
      )}

      {albums && albums.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {(albums as Album[]).map((album) => (
            <Link key={album.id} href={`/album/${album.id}`}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-all group"
              style={{ border: '1px solid #E2E8F0' }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: '#EFF6FF' }}>
                  📔
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate group-hover:text-teal-600 transition-colors"
                    style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
                    {album.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                    {new Date(album.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  {album.is_published && (
                    <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#F0FDF4', color: '#16A34A' }}>
                      公開中
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: '#0D9488' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #E2E8F0' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: '#EFF6FF' }}>📔</div>
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>まだアルバムがありません</h2>
          <p className="text-base mb-8" style={{ color: '#64748B' }}>セッションの記録をまとめてアルバムを作りましょう</p>
          {selectedSubject && (
            <Link href={`/album/new?subjectId=${selectedSubject.id}`}
              className="inline-flex items-center px-8 py-4 rounded-full text-base font-bold text-white hover:opacity-90"
              style={{ background: '#1B3A6B' }}>
              アルバムを作成する
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
