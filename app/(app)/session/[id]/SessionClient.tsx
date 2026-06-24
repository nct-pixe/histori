'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Subject, LifeStage } from '@/lib/supabase/types'
import type { Question } from '@/lib/questions/bank'

interface Props {
  subject: Subject
  lifeStage: LifeStage
  stageLabel: string
  questions: Question[]
  sessionId: string
}

export default function SessionClient({ subject, stageLabel, questions, sessionId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFollowup, setShowFollowup] = useState(false)
  const [sharedMode, setSharedMode] = useState(false)
  const [showEmotionGuide, setShowEmotionGuide] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentQ = questions[currentIndex]
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  async function saveAnswer(text: string) {
    if (!sessionId || !currentQ) return
    setSaving(true)
    await supabase.from('answers').insert({
      session_id: sessionId,
      question_id: currentQ.id,
      question_text: currentQ.text,
      answer_text: text,
    })
    setSaving(false)
  }

  async function handleNext() {
    const answer = answers[currentQ.id] || ''
    await saveAnswer(answer)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setShowFollowup(false)
    } else {
      await supabase.from('sessions').update({ completed_at: new Date().toISOString() }).eq('id', sessionId)
      setCompleted(true)
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowFollowup(false)
    }
  }

  if (completed) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-6">
        <div className="text-6xl">🎊</div>
        <h2 className="text-3xl font-bold text-[#1B3A6B]">セッション完了！</h2>
        <p className="text-xl text-gray-500">
          {subject.name} さんとの大切な時間を記録しました。
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/album?subjectId=${subject.id}`)}
            className="w-full h-16 bg-[#0D9488] text-white text-xl font-bold rounded-xl hover:bg-teal-700"
          >
            アルバムを作る
          </button>
          <button
            onClick={() => router.push('/session')}
            className="w-full h-14 border-2 border-gray-200 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50"
          >
            別のステージを続ける
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full h-14 border-2 border-gray-200 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto ${sharedMode ? 'bg-[#1B3A6B] min-h-screen p-8 rounded-2xl' : ''}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${sharedMode ? 'text-white' : 'text-[#1B3A6B]'}`}>
            {subject.name} さん ／ {stageLabel}
          </h1>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 max-w-xs">
            <div className="bg-[#0D9488] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className={`text-base mt-1 ${sharedMode ? 'text-teal-200' : 'text-gray-500'}`}>
            {currentIndex + 1} / {questions.length} 問
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmotionGuide(true)}
            className="h-12 px-4 bg-amber-100 text-amber-700 text-base font-medium rounded-xl hover:bg-amber-200"
          >
            💛 感情ケア
          </button>
          <button
            onClick={() => setSharedMode((v) => !v)}
            className="h-12 px-4 bg-teal-100 text-[#0D9488] text-base font-medium rounded-xl hover:bg-teal-200"
          >
            {sharedMode ? '👤 通常モード' : '👥 一緒に見る'}
          </button>
          <button
            onClick={() => router.push('/session')}
            className="h-12 px-4 bg-red-50 text-red-500 text-base font-medium rounded-xl hover:bg-red-100"
          >
            ✕ 中断
          </button>
        </div>
      </div>

      {/* 質問カード */}
      <div className={`rounded-2xl p-8 mb-6 ${sharedMode ? 'bg-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <p className={`font-bold leading-relaxed ${sharedMode ? 'text-4xl text-[#1B3A6B] text-center' : 'text-2xl text-[#1F2937]'}`}>
          {currentQ?.text}
        </p>

        {!sharedMode && currentQ?.followups && currentQ.followups.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowFollowup((v) => !v)}
              className="text-base text-[#0D9488] hover:underline"
            >
              {showFollowup ? '▲ 深掘りを閉じる' : '▼ 深掘りサジェスト'}
            </button>
            {showFollowup && (
              <ul className="mt-3 space-y-2">
                {currentQ.followups.map((f, i) => (
                  <li key={i} className="text-lg text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                    ・{f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 回答入力（通常モードのみ） */}
      {!sharedMode && (
        <textarea
          value={answers[currentQ?.id] || ''}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
          className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:border-[#0D9488] resize-none mb-6"
          rows={4}
          placeholder="回答・メモを入力してください（省略可）"
        />
      )}

      {/* ナビゲーション */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className={`flex-1 h-16 border-2 border-gray-300 text-gray-600 text-xl font-bold rounded-xl disabled:opacity-30 hover:bg-gray-50 ${sharedMode ? 'text-gray-800' : ''}`}
        >
          ← 戻る
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex-2 flex-1 h-16 bg-[#1B3A6B] text-white text-xl font-bold rounded-xl hover:bg-[#162d54] disabled:opacity-50"
        >
          {saving ? '保存中...' : currentIndex === questions.length - 1 ? '完了 ✓' : '次へ →'}
        </button>
      </div>

      {/* 感情ケアモーダル */}
      {showEmotionGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-4">
            <h3 className="text-2xl font-bold text-[#1B3A6B]">💛 感情ケアガイド</h3>
            <div className="space-y-3 text-lg text-gray-700">
              <p className="font-bold">ネガティブな感情が出てきたときは</p>
              <ul className="space-y-2">
                <li>・「それはつらかったですね」と共感の言葉をかける</li>
                <li>・無理に続けず、「今日はここまでにしましょう」と伝える</li>
                <li>・好きな音楽や写真に話題を変える</li>
                <li>・手を握る、肩に触れるなど身体的な安心感を伝える</li>
              </ul>
              <p className="font-bold mt-4">涙が出てきたときは</p>
              <ul className="space-y-2">
                <li>・泣くことを止めず、そっと見守る</li>
                <li>・「たくさん思い出してくれてありがとう」と伝える</li>
                <li>・水分補給を促し、少し休憩する</li>
              </ul>
            </div>
            <button
              onClick={() => setShowEmotionGuide(false)}
              className="w-full h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
