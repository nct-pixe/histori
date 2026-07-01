import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'
import { Sun, GraduationCap, Sparkles, Heart, Briefcase, Flower2, Star, ArrowRight, ShieldAlert } from 'lucide-react'

const CARE_NOTES = [
  '否定や訂正はせず、まずは話を最後まで受け止めましょう',
  '答えを急かさず、沈黙も大切な時間として待ちましょう',
  'つらい記憶に触れた場合は無理に深掘りせず、話題を切り替えましょう',
  '一度に多くの質問をせず、1つずつゆったりと進めましょう',
]

const LIFE_STAGES = [
  { id: 'childhood', label: '幼少期',   Icon: Sun,          desc: '生まれてから小学校入学まで', accent: '#F59E0B', bg: '#FFFBEB' },
  { id: 'school',    label: '学校時代', Icon: GraduationCap, desc: '小・中・高・大学時代',      accent: '#3B82F6', bg: '#EFF6FF' },
  { id: 'youth',     label: '青年期',   Icon: Sparkles,     desc: '就職・一人暮らし・自立',     accent: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'family',    label: '家庭期',   Icon: Heart,        desc: '結婚・子育て・家族のこと',   accent: '#EC4899', bg: '#FDF2F8' },
  { id: 'prime',     label: '働き盛り', Icon: Briefcase,    desc: '仕事・キャリアの最盛期',     accent: '#D97706', bg: '#FFF7ED' },
  { id: 'senior',    label: '晩年期',   Icon: Flower2,      desc: '定年後・孫との時間',         accent: '#10B981', bg: '#F0FDF4' },
  { id: 'present',   label: '現在',     Icon: Star,         desc: '今の生活・まとめ',           accent: '#0D9488', bg: '#F0FDFA' },
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
        <h1 className="text-2xl md:text-4xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>回想法セッション</h1>
        <p className="text-base" style={{ color: '#64748B' }}>ライフステージを選んで聴き取りを始めましょう</p>
      </div>

      {/* 主人公選択 */}
      {subjects && subjects.length > 0 && (
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ border: '1px solid #E2E8F0' }}>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#374151' }}>主人公を選択</label>
          <div className="flex gap-2 flex-wrap">
            {(subjects as Subject[]).map((s) => (
              <Link key={s.id} href={`/session?subjectId=${s.id}`}
                className="px-5 py-2.5 rounded-full text-base font-medium transition-colors"
                style={s.id === selectedSubject?.id
                  ? { background: '#1B3A6B', color: 'white' }
                  : { background: '#F1F5F9', color: '#475569' }}>
                {s.name} さん
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 回想時の注意点 */}
      <div className="rounded-2xl p-5 mb-8 flex gap-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <ShieldAlert size={20} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <div>
          <h2 className="text-sm font-bold mb-2" style={{ color: '#92400E' }}>回想する際の注意点</h2>
          <ul className="space-y-1">
            {CARE_NOTES.map((note, i) => (
              <li key={i} className="text-sm" style={{ color: '#78350F' }}>・{note}</li>
            ))}
          </ul>
        </div>
      </div>

      {selectedSubject ? (
        <>
          <p className="text-base mb-5" style={{ color: '#64748B' }}>
            <span className="font-bold" style={{ color: '#1B3A6B' }}>{selectedSubject.name}</span> さんのセッション
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {LIFE_STAGES.map((stage) => {
              const Icon = stage.Icon
              return (
                <Link key={stage.id}
                  href={`/session/${stage.id}?subjectId=${selectedSubject.id}`}
                  className="bg-white rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 group flex items-center gap-4"
                  style={{ border: '1px solid #E2E8F0' }}>
                  {/* アイコン */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stage.bg }}>
                    <Icon size={22} strokeWidth={1.8} style={{ color: stage.accent }} />
                  </div>
                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
                      {stage.label}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{stage.desc}</p>
                  </div>
                  {/* 矢印 */}
                  <ArrowRight size={16} strokeWidth={2} className="flex-shrink-0 transition-transform group-hover:translate-x-1"
                    style={{ color: '#CBD5E1' }} />
                </Link>
              )
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-lg mb-6" style={{ color: '#64748B' }}>主人公が登録されていません</p>
          <Link href="/setup"
            className="inline-flex items-center px-8 py-3.5 rounded-full text-base font-bold text-white"
            style={{ background: '#1B3A6B' }}>
            主人公を登録する
          </Link>
        </div>
      )}
    </div>
  )
}
