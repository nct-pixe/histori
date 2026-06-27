import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'

const LIFE_STAGES = [
  { id: 'childhood', label: '幼少期',   emoji: '🧒', desc: '生まれてから小学校入学まで', color: '#FEF3C7' },
  { id: 'school',    label: '学校時代', emoji: '📚', desc: '小・中・高・大学時代',       color: '#EFF6FF' },
  { id: 'youth',     label: '青年期',   emoji: '🌟', desc: '就職・一人暮らし・自立',     color: '#F0FDF4' },
  { id: 'family',    label: '家庭期',   emoji: '👨‍👩‍👧', desc: '結婚・子育て・家族のこと', color: '#FDF4FF' },
  { id: 'prime',     label: '働き盛り', emoji: '💼', desc: '仕事・キャリアの最盛期',     color: '#FFF7ED' },
  { id: 'senior',    label: '晩年期',   emoji: '🌸', desc: '定年後・孫との時間',         color: '#FFF1F2' },
  { id: 'present',   label: '現在',     emoji: '✨', desc: '今の生活・まとめ',           color: '#F0FDF4' },
]

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { subjectId } = await searchParams
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })

  const selectedSubject = subjectId
    ? (subjects as Subject[])?.find((s) => s.id === subjectId)
    : (subjects as Subject[])?.[0]

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>SESSION</p>
        <h1 className="text-4xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>回想法セッション</h1>
        <p className="text-base" style={{ color: '#64748B' }}>ライフステージを選んで聴き取りを始めましょう</p>
      </div>

      {/* 主人公選択 */}
      {subjects && subjects.length > 0 && (
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ border: '1px solid #E2E8F0' }}>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#374151' }}>主人公を選択</label>
          <div className="flex gap-2 flex-wrap">
            {(subjects as Subject[]).map((s) => (
              <Link
                key={s.id}
                href={`/session?subjectId=${s.id}`}
                className="px-5 py-2.5 rounded-full text-base font-medium transition-colors"
                style={
                  s.id === selectedSubject?.id
                    ? { background: '#1B3A6B', color: 'white' }
                    : { background: '#F1F5F9', color: '#475569' }
                }
              >
                {s.name} さん
              </Link>
            ))}
          </div>
        </div>
      )}

      {selectedSubject ? (
        <>
          <p className="text-lg mb-5" style={{ color: '#374151' }}>
            <span className="font-bold" style={{ color: '#1B3A6B' }}>{selectedSubject.name}</span> さんのセッション
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LIFE_STAGES.map((stage) => (
              <Link
                key={stage.id}
                href={`/session/${stage.id}?subjectId=${selectedSubject.id}`}
                className="bg-white rounded-2xl p-6 transition-all hover:shadow-md group"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: stage.color }}
                >
                  {stage.emoji}
                </div>
                <h3 className="text-lg font-bold mb-1 transition-colors" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
                  {stage.label}
                </h3>
                <p className="text-sm mb-4" style={{ color: '#64748B' }}>{stage.desc}</p>
                <div className="text-sm font-semibold flex items-center gap-1" style={{ color: '#0D9488' }}>
                  セッションを始める <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>主人公が登録されていません</p>
          <Link
            href="/setup"
            className="inline-flex items-center px-8 py-3.5 rounded-full text-base font-bold text-white"
            style={{ background: '#1B3A6B' }}
          >
            主人公を登録する
          </Link>
        </div>
      )}
    </div>
  )
}
