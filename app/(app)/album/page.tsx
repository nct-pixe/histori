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

  async function createAlbum() {
    'use server'
    if (!selectedSubject) return
    const supabase = await createClient()
    const { data } = await supabase.from('albums').insert({
      subject_id: selectedSubject.id,
      title: `${selectedSubject.name}さんのアルバム`,
    }).select().single()
    if (data) {
      // redirect handled by link
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3A6B]">アルバム</h1>
          {selectedSubject && (
            <p className="text-xl text-gray-500 mt-1">{selectedSubject.name} さんの思い出アルバム</p>
          )}
        </div>
        {selectedSubject && (
          <Link
            href={`/album/new?subjectId=${selectedSubject.id}`}
            className="h-14 px-6 bg-[#0D9488] text-white text-lg font-bold rounded-xl hover:bg-teal-700 flex items-center"
          >
            ＋ 新しいアルバム
          </Link>
        )}
      </div>

      {subjects && subjects.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex gap-3 flex-wrap">
            {(subjects as Subject[]).map((s) => (
              <Link key={s.id} href={`/album?subjectId=${s.id}`}
                className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
                  s.id === selectedSubject?.id ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {s.name} さん
              </Link>
            ))}
          </div>
        </div>
      )}

      {albums && albums.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(albums as Album[]).map((album) => (
            <Link key={album.id} href={`/album/${album.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📔</div>
              <h3 className="text-xl font-bold text-[#1F2937]">{album.title}</h3>
              <p className="text-base text-gray-500 mt-1">
                作成日：{new Date(album.created_at).toLocaleDateString('ja-JP')}
              </p>
              {album.is_published && (
                <span className="mt-3 inline-block px-3 py-1 bg-green-50 text-green-700 text-base rounded-full">公開中</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-5xl mb-4">📔</div>
          <p className="text-xl text-gray-500 mb-6">まだアルバムがありません</p>
          {selectedSubject && (
            <Link href={`/album/new?subjectId=${selectedSubject.id}`}
              className="inline-flex items-center h-14 px-8 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
              アルバムを作成する
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
