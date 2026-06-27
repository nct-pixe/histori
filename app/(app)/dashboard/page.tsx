import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'

export default async function DashboardPage() {
  let subjects: Subject[] | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    subjects = data
  } catch {
    // DB未接続時は空で表示
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>DASHBOARD</p>
          <h1 className="text-4xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>ダッシュボード</h1>
          <p className="mt-1 text-base" style={{ color: '#64748B' }}>回想支援の進捗と、対象者ごとの状態をひと目で確認できます</p>
        </div>
        <Link
          href="/setup"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold text-white transition-colors hover:opacity-90"
          style={{ background: '#0D9488' }}
        >
          ＋ 主人公を登録
        </Link>
      </div>

      {subjects && subjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const careLabels: Record<number, { label: string; color: string }> = {
    1: { label: '軽度', color: '#3B82F6' },
    2: { label: '中度', color: '#F59E0B' },
    3: { label: '重度', color: '#EF4444' },
  }
  const goalLabels: Record<string, string> = {
    care: '回想法ケア', album: 'アルバム作成', music: '音楽療法', video: '動画回想', all: 'すべて',
  }

  const care = careLabels[subject.care_level ?? 2]

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      {/* カードヘッダー */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
              {subject.name} さん
            </h2>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              {subject.birth_year && `${subject.birth_year}年生まれ`}
              {subject.birth_region && `　${subject.birth_region}`}
            </p>
            {subject.career && (
              <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{subject.career}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {care && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: care.color }}
              >
                {care.label}
              </span>
            )}
            {subject.session_goal && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#F0FDF4', color: '#0D9488' }}
              >
                {goalLabels[subject.session_goal]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Link
          href={`/session?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#1B3A6B' }}
        >
          💬 セッション
        </Link>
        <Link
          href={`/album?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#0D9488' }}
        >
          📔 アルバム
        </Link>
        <Link
          href={`/music?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#D97706' }}
        >
          🎵 音楽
        </Link>
        <Link
          href={`/video?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#475569' }}
        >
          🎬 動画
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center" style={{ border: '1px solid #E2E8F0' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#F0FDF4' }}>
        <span className="text-4xl">📖</span>
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
        まだ主人公が登録されていません
      </h2>
      <p className="text-base mb-8" style={{ color: '#64748B' }}>
        回想法セッションを始めるために、<br />
        まず大切な方のプロフィールを登録しましょう。
      </p>
      <Link
        href="/setup"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: '#1B3A6B' }}
      >
        プロフィールを登録する
      </Link>
    </div>
  )
}
