import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'

export default async function DashboardPage() {
  let subjects: Subject[] | null = null
  let sessions: { subject_id: string }[] | null = null
  let albums: { subject_id: string }[] | null = null

  try {
    const supabase = await createClient()
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    subjects = subjectsData

    const subjectIds = (subjects as Subject[] | null)?.map((s) => s.id) ?? []
    if (subjectIds.length > 0) {
      const [{ data: sessionsData }, { data: albumsData }] = await Promise.all([
        supabase.from('sessions').select('subject_id').in('subject_id', subjectIds),
        supabase.from('albums').select('subject_id').in('subject_id', subjectIds),
      ])
      sessions = sessionsData
      albums = albumsData
    }
  } catch {
    // Supabase未接続時はデータなしで表示
  }

  const sessionCount = (id: string) => sessions?.filter((s: { subject_id: string }) => s.subject_id === id).length ?? 0
  const albumCount = (id: string) => albums?.filter((a: { subject_id: string }) => a.subject_id === id).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3A6B]">ホーム</h1>
          <p className="text-xl text-gray-500 mt-1">回想法セッションを始めましょう</p>
        </div>
        <Link
          href="/setup"
          className="h-16 px-8 bg-[#0D9488] text-white text-xl font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          ＋ 主人公を登録
        </Link>
      </div>

      {subjects && subjects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {(subjects as Subject[]).map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              sessions={sessionCount(subject.id)}
              albums={albumCount(subject.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function SubjectCard({
  subject,
  sessions,
  albums,
}: {
  subject: Subject
  sessions: number
  albums: number
}) {
  const careLabels: Record<number, string> = { 1: '軽度', 2: '中度', 3: '重度' }
  const goalLabels: Record<string, string> = {
    care: '回想法ケア',
    album: 'アルバム作成',
    music: '音楽療法',
    video: '動画回想',
    all: 'すべて',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* プロフィール行 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">{subject.name} さん</h2>
          <p className="text-lg text-gray-500 mt-1">
            {subject.birth_year && `${subject.birth_year}年生まれ`}
            {subject.birth_region && `　${subject.birth_region}`}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {subject.care_level && (
              <span className="px-3 py-1 bg-blue-50 text-[#1B3A6B] rounded-full text-base font-medium">
                {careLabels[subject.care_level]}
              </span>
            )}
            {subject.session_goal && (
              <span className="px-3 py-1 bg-teal-50 text-[#0D9488] rounded-full text-base font-medium">
                {goalLabels[subject.session_goal]}
              </span>
            )}
          </div>
        </div>
        <div className="text-4xl">👤</div>
      </div>

      {/* 統計 */}
      <div className="flex gap-4 mb-5 text-base">
        <span className="text-gray-500">
          <span className="text-2xl font-bold text-[#1B3A6B]">{sessions}</span> セッション
        </span>
        <span className="text-gray-500">
          <span className="text-2xl font-bold text-[#0D9488]">{albums}</span> アルバム
        </span>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/session?subjectId=${subject.id}`}
          className="h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54] transition-colors flex items-center justify-center gap-2"
        >
          💬 セッション
        </Link>
        <Link
          href={`/album?subjectId=${subject.id}`}
          className="h-14 bg-[#0D9488] text-white text-lg font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          📔 アルバム
        </Link>
        <Link
          href={`/music?subjectId=${subject.id}`}
          className="h-14 bg-[#D97706] text-white text-lg font-bold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          🎵 音楽
        </Link>
        <Link
          href={`/video?subjectId=${subject.id}`}
          className="h-14 bg-gray-700 text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          🎬 動画
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="text-6xl mb-4">📖</div>
      <h2 className="text-2xl font-bold text-[#1F2937] mb-3">
        まだ主人公が登録されていません
      </h2>
      <p className="text-xl text-gray-500 mb-8">
        回想法セッションを始めるために、<br />
        まず大切な方のプロフィールを登録しましょう。
      </p>
      <Link
        href="/setup"
        className="inline-flex items-center h-16 px-10 bg-[#1B3A6B] text-white text-xl font-bold rounded-xl hover:bg-[#162d54] transition-colors"
      >
        プロフィールを登録する
      </Link>
    </div>
  )
}
