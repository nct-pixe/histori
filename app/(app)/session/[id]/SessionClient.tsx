'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Subject, LifeStage } from '@/lib/supabase/types'
import type { Question } from '@/lib/questions/bank'
import MicButton from '@/components/MicButton'

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
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl" style={{ background: '#F0FDF4' }}>🎊</div>
        <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>セッション完了！</h2>
        <p className="text-lg" style={{ color: '#64748B' }}>
          {subject.name} さんとの大切な時間を記録しました。
        </p>
        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push(`/album?subjectId=${subject.id}`)}
            className="w-full py-4 rounded-full text-base font-bold text-white hover:opacity-90"
            style={{ background: '#0D9488' }}
          >
            アルバムを作る
          </button>
          <button
            onClick={() => router.push('/session')}
            className="w-full py-4 rounded-full text-base font-bold hover:opacity-80"
            style={{ background: '#F1F5F9', color: '#475569' }}
          >
            別のステージを続ける
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 rounded-full text-base font-bold hover:opacity-80"
            style={{ background: '#F1F5F9', color: '#475569' }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto ${sharedMode ? 'min-h-screen p-8 rounded-2xl' : ''}`}
      style={sharedMode ? { background: '#1B3A6B' } : {}}>

      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: sharedMode ? '#5EEAD4' : '#0D9488' }}>SESSION</p>
          <h1 className="text-2xl font-bold" style={{ color: sharedMode ? 'white' : '#1B3A6B', fontFamily: 'serif' }}>
            {subject.name} さん ／ {stageLabel}
          </h1>
          {/* プログレスバー */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 rounded-full h-1.5" style={{ background: sharedMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: '#0D9488' }} />
            </div>
            <span className="text-sm whitespace-nowrap" style={{ color: sharedMode ? '#5EEAD4' : '#64748B' }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4 flex-wrap justify-end">
          <button
            onClick={() => setShowEmotionGuide(true)}
            className="px-3 py-2 rounded-full text-sm font-medium"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            💛 感情ケア
          </button>
          <button
            onClick={() => setSharedMode((v) => !v)}
            className="px-3 py-2 rounded-full text-sm font-medium"
            style={{ background: '#F0FDF4', color: '#0D9488' }}
          >
            {sharedMode ? '👤 通常' : '👥 一緒に見る'}
          </button>
          <button
            onClick={() => router.push('/session')}
            className="px-3 py-2 rounded-full text-sm font-medium"
            style={{ background: '#FEF2F2', color: '#DC2626' }}
          >
            ✕ 中断
          </button>
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <p className={`font-bold leading-relaxed ${sharedMode ? 'text-4xl text-center' : 'text-2xl'}`}
          style={{ color: '#1B3A6B', fontFamily: 'serif' }}>
          {currentQ?.text}
        </p>

        {!sharedMode && currentQ?.followups && currentQ.followups.length > 0 && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={() => setShowFollowup((v) => !v)}
              className="text-sm font-medium hover:underline"
              style={{ color: '#0D9488' }}
            >
              {showFollowup ? '▲ 深掘りを閉じる' : '▼ 深掘りサジェスト'}
            </button>
            {showFollowup && (
              <ul className="mt-3 space-y-2">
                {currentQ.followups.map((f, i) => (
                  <li key={i} className="text-base rounded-xl px-4 py-3" style={{ background: '#F8FAFC', color: '#475569' }}>
                    ・{f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 回答入力 */}
      {!sharedMode && (
        <div className="relative mb-6">
          <textarea
            value={answers[currentQ?.id] || ''}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
            className="w-full rounded-2xl px-5 py-4 text-base resize-none pr-16 outline-none transition-all"
            style={{ border: '1.5px solid #E2E8F0', color: '#1F2937', fontSize: '1.1rem', lineHeight: '1.7' }}
            onFocus={(e) => e.target.style.borderColor = '#0D9488'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            rows={4}
            placeholder="回答・メモを入力してください（省略可）"
          />
          <MicButton
            onResult={(text) => setAnswers((prev) => ({ ...prev, [currentQ.id]: (prev[currentQ.id] || '') + text }))}
            className="absolute bottom-3 right-3"
          />
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex gap-3">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="flex-1 py-4 rounded-full text-base font-bold disabled:opacity-30 transition-opacity hover:opacity-80"
          style={{ background: '#F1F5F9', color: '#475569' }}
        >
          ← 戻る
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex-1 py-4 rounded-full text-base font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ background: '#1B3A6B' }}
        >
          {saving ? '保存中...' : currentIndex === questions.length - 1 ? '完了 ✓' : '次へ →'}
        </button>
      </div>

      {/* 感情ケアモーダル */}
      {showEmotionGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
            <h3 className="text-2xl font-bold mb-5" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>💛 感情ケアガイド</h3>
            <div className="space-y-4 text-base" style={{ color: '#374151' }}>
              <div>
                <p className="font-bold mb-2">ネガティブな感情が出てきたときは</p>
                <ul className="space-y-1.5 pl-2" style={{ color: '#64748B' }}>
                  <li>・「それはつらかったですね」と共感の言葉をかける</li>
                  <li>・無理に続けず、「今日はここまでにしましょう」と伝える</li>
                  <li>・好きな音楽や写真に話題を変える</li>
                  <li>・手を握る、肩に触れるなど身体的な安心感を伝える</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">涙が出てきたときは</p>
                <ul className="space-y-1.5 pl-2" style={{ color: '#64748B' }}>
                  <li>・泣くことを止めず、そっと見守る</li>
                  <li>・「たくさん思い出してくれてありがとう」と伝える</li>
                  <li>・水分補給を促し、少し休憩する</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowEmotionGuide(false)}
              className="w-full mt-6 py-3.5 rounded-full text-base font-bold text-white"
              style={{ background: '#1B3A6B' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
