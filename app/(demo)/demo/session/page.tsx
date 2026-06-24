import Link from 'next/link'
import { DEMO_SUBJECT } from '@/lib/demo/mockData'

const LIFE_STAGES = [
  { id: 'childhood', label: '幼少期',   emoji: '🧒', desc: '生まれてから小学校入学まで' },
  { id: 'school',    label: '学校時代', emoji: '📚', desc: '小・中・高・大学時代' },
  { id: 'youth',     label: '青年期',   emoji: '🌟', desc: '就職・一人暮らし・自立' },
  { id: 'family',    label: '家庭期',   emoji: '👨‍👩‍👧', desc: '結婚・子育て・家族のこと' },
  { id: 'prime',     label: '働き盛り', emoji: '💼', desc: '仕事・キャリアの最盛期' },
  { id: 'senior',    label: '晩年期',   emoji: '🌸', desc: '定年後・孫との時間' },
  { id: 'present',   label: '現在',     emoji: '✨', desc: '今の生活・まとめ' },
]

export default function DemoSessionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">回想法セッション</h1>
      <p className="text-xl text-gray-500 mb-2">ライフステージを選んで聴き取りを始めましょう</p>
      <p className="text-lg text-[#1B3A6B] font-medium mb-8">
        主人公：{DEMO_SUBJECT.name} さん
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LIFE_STAGES.map((stage) => (
          <Link key={stage.id} href={`/demo/session/${stage.id}`}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[#0D9488] transition-all group">
            <div className="text-4xl mb-3">{stage.emoji}</div>
            <h3 className="text-xl font-bold text-[#1F2937] group-hover:text-[#0D9488] transition-colors">
              {stage.label}
            </h3>
            <p className="text-base text-gray-500 mt-1">{stage.desc}</p>
            <div className="mt-4 text-[#0D9488] font-medium">セッションを始める →</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
