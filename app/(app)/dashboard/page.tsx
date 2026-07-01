import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'
import { MessageCircle, BookOpen, Video, UserPlus, Heart } from 'lucide-react'

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
      <div className="rounded-2xl p-6 mb-8 flex items-start justify-between gap-3" style={{ background: 'linear-gradient(135deg, #FFEDD5 0%, #FFF9E8 100%)', border: '1px solid #FED7AA' }}>
        <div>
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#EA580C' }}>DASHBOARD</p>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>ダッシュボード</h1>
          <p className="text-sm" style={{ color: '#78716C' }}>回想支援の進捗と、対象者ごとの状態をひと目で確認できます</p>
        </div>
        <Link
          href="/setup"
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold text-white transition-colors hover:opacity-90"
          style={{ background: '#F97316' }}
        >
          ＋ 登録
        </Link>
      </div>

      {subjects && subjects.length > 0 ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 400px))' }}>
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
  const initial = subject.name?.[0] ?? '？'

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#FFFDF9', border: '1px solid #EDE6D8' }}>
      {/* カードヘッダー */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F5EFE3' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{ background: '#FFEDD5', color: '#EA580C', fontFamily: 'serif' }}>
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold truncate" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
                {subject.name} さん
              </h2>
              <p className="text-sm mt-1" style={{ color: '#78716C' }}>
                {subject.birth_year && `${subject.birth_year}年生まれ`}
                {subject.birth_region && `　${subject.birth_region}`}
              </p>
              {subject.career && (
                <p className="text-sm mt-0.5" style={{ color: '#A8A29E' }}>{subject.career}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
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
                style={{ background: '#FFEDD5', color: '#EA580C' }}
              >
                {goalLabels[subject.session_goal]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Link href={`/session?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#1B3A6B' }}>
          <MessageCircle size={17} strokeWidth={2} /> セッション
        </Link>
        <Link href={`/album?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: '#0D9488' }}>
          <BookOpen size={17} strokeWidth={2} /> アルバム
        </Link>
        <Link href={`/video?subjectId=${subject.id}`}
          className="flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 col-span-2"
          style={{ background: '#F97316' }}>
          <Video size={17} strokeWidth={2} /> 動画
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl shadow-sm p-16 text-center" style={{ background: '#FFFDF9', border: '1px solid #EDE6D8' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#FFEDD5' }}>
        <Heart size={32} strokeWidth={1.8} style={{ color: '#EA580C' }} />
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
        まだ主人公が登録されていません
      </h2>
      <p className="text-base mb-8" style={{ color: '#78716C' }}>
        回想法セッションを始めるために、<br />
        まず大切な方のプロフィールを登録しましょう。
      </p>
      <Link href="/setup"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: '#1B3A6B' }}>
        <UserPlus size={20} /> プロフィールを登録する
      </Link>
    </div>
  )
}
