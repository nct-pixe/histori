import Link from 'next/link'
import { DEMO_SUBJECT, DEMO_ANSWERS } from '@/lib/demo/mockData'

export default function DemoDashboard() {
  const sessions = 2
  const albums = 1

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3A6B]">ホーム</h1>
          <p className="text-xl text-gray-500 mt-1">回想法セッションを始めましょう</p>
        </div>
        <span className="h-14 px-6 bg-gray-100 text-gray-400 text-lg font-bold rounded-xl flex items-center">
          ＋ 主人公を登録（デモ）
        </span>
      </div>

      {/* 主人公カード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">{DEMO_SUBJECT.name} さん</h2>
            <p className="text-lg text-gray-500 mt-1">
              {DEMO_SUBJECT.birth_year}年生まれ　{DEMO_SUBJECT.birth_region}
            </p>
            <p className="text-base text-gray-400 mt-1">{DEMO_SUBJECT.career}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-50 text-[#1B3A6B] rounded-full text-base font-medium">中度</span>
              <span className="px-3 py-1 bg-teal-50 text-[#0D9488] rounded-full text-base font-medium">すべて</span>
            </div>
          </div>
          <div className="text-5xl">👩</div>
        </div>

        {/* 統計 */}
        <div className="flex gap-6 mb-5 text-base">
          <span className="text-gray-500">
            <span className="text-2xl font-bold text-[#1B3A6B]">{sessions}</span> セッション
          </span>
          <span className="text-gray-500">
            <span className="text-2xl font-bold text-[#0D9488]">{albums}</span> アルバム
          </span>
          <span className="text-gray-500">
            <span className="text-2xl font-bold text-[#D97706]">{DEMO_ANSWERS.length}</span> 回答
          </span>
        </div>

        {/* ボタン */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/demo/session"
            className="h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54] transition-colors flex items-center justify-center gap-2">
            💬 セッション
          </Link>
          <Link href="/demo/album/demo-album-001"
            className="h-14 bg-[#0D9488] text-white text-lg font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
            📔 アルバム
          </Link>
          <Link href="/demo/music"
            className="h-14 bg-[#D97706] text-white text-lg font-bold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
            🎵 音楽
          </Link>
          <Link href="/demo/video"
            className="h-14 bg-gray-700 text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            🎬 動画
          </Link>
        </div>
      </div>

      {/* 最近の回答 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-4">最近のセッション回答</h2>
        <div className="space-y-3">
          {DEMO_ANSWERS.slice(0, 3).map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-base text-[#0D9488] font-medium mb-1">Q. {a.question_text}</p>
              <p className="text-lg text-[#1F2937]">{a.answer_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
