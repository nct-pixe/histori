import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Subject } from '@/lib/supabase/types'

const LIFE_STAGES = [
  { id: 'childhood', label: '幼少期', emoji: '🧒', desc: '生まれてから小学校入学まで' },
  { id: 'school',    label: '学校時代', emoji: '📚', desc: '小・中・高・大学時代' },
  { id: 'youth',     label: '青年期', emoji: '🌟', desc: '就職・一人暮らし・自立' },
  { id: 'family',    label: '家庭期', emoji: '👨‍👩‍👧', desc: '結婚・子育て・家族のこと' },
  { id: 'prime',     label: '働き盛り', emoji: '💼', desc: '仕事・キャリアの最盛期' },
  { id: 'senior',    label: '晩年期', emoji: '🌸', desc: '定年後・孫との時間' },
  { id: 'present',   label: '現在', emoji: '✨', desc: '今の生活・まとめ' },
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
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">回想法セッション</h1>
      <p className="text-xl text-gray-500 mb-8">ライフステージを選んで聴き取りを始めましょう</p>

      {subjects && subjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
          <label className="block text-lg font-medium mb-2">主人公を選択</label>
          <div className="flex gap-3 flex-wrap">
            {(subjects as Subject[]).map((s) => (
              <Link
                key={s.id}
                href={`/session?subjectId=${s.id}`}
                className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
                  s.id === selectedSubject?.id
                    ? 'bg-[#1B3A6B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.name} さん
              </Link>
            ))}
          </div>
        </div>
      )}

      {selectedSubject ? (
        <>
          <p className="text-xl mb-6">
            <span className="font-bold text-[#1B3A6B]">{selectedSubject.name}</span> さんのセッション
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LIFE_STAGES.map((stage) => (
              <Link
                key={stage.id}
                href={`/session/${stage.id}?subjectId=${selectedSubject.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[#0D9488] transition-all group"
              >
                <div className="text-4xl mb-3">{stage.emoji}</div>
                <h3 className="text-xl font-bold text-[#1F2937] group-hover:text-[#0D9488] transition-colors">
                  {stage.label}
                </h3>
                <p className="text-base text-gray-500 mt-1">{stage.desc}</p>
                <div className="mt-4 text-[#0D9488] font-medium">
                  セッションを始める →
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-xl text-gray-500 mb-6">主人公が登録されていません</p>
          <Link href="/setup" className="inline-flex items-center h-14 px-8 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
            主人公を登録する
          </Link>
        </div>
      )}
    </div>
  )
}
