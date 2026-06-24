'use client'

import { useState, useRef, useEffect } from 'react'
import { DEMO_SUBJECT, DEMO_VIDEOS } from '@/lib/demo/mockData'
import type { ReactionType, VideoFile } from '@/lib/supabase/types'

export default function DemoVideoPage() {
  const [activeVideo, setActiveVideo] = useState<VideoFile | null>(null)
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [sessionActive, setSessionActive] = useState(false)
  const [reactionLog, setReactionLog] = useState<Array<{ timestamp: number; reaction: ReactionType }>>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current!); setSessionActive(false); return 0 } return t - 1 })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionActive])

  function startSession(video: VideoFile) {
    setActiveVideo(video)
    setTimeLeft(30 * 60)
    setSessionActive(true)
    setReactionLog([])
  }

  function formatTime(secs: number) {
    return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`
  }

  function recordReaction(reaction: ReactionType) {
    const timestamp = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
    setReactionLog((prev) => [...prev, { timestamp, reaction }])
  }

  const isAlert = timeLeft <= 300 && timeLeft > 0 && sessionActive

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">動画回想セッション</h1>
      <p className="text-xl text-gray-500 mb-8">{DEMO_SUBJECT.name} さんの動画ライブラリ</p>

      {/* セッション中 */}
      {activeVideo && (
        <div className="bg-[#1B3A6B] rounded-2xl p-6 mb-8 text-white">
          <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-[#162d54]'}`}>
            <span className="text-xl font-bold">⏱ 残り時間</span>
            <span className="text-3xl font-bold font-mono">{formatTime(timeLeft)}</span>
            <button onClick={() => { setSessionActive(false); setActiveVideo(null) }}
              className="h-10 px-4 bg-white text-[#1B3A6B] text-base font-bold rounded-xl">
              終了
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl h-48 flex items-center justify-center mb-4 text-gray-400 text-lg">
            🎬 {activeVideo.title}
            <br />
            <span className="text-sm mt-2">（デモ：実際の動画ファイルが必要です）</span>
          </div>

          <p className="text-xl font-bold mb-4">{activeVideo.title}</p>
          <p className="text-base text-teal-200 mb-3">反応を記録する</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { type: 'smile' as const, emoji: '😊', label: '笑顔' },
              { type: 'talk' as const, emoji: '💬', label: '発話' },
              { type: 'tear' as const, emoji: '😢', label: '涙' },
              { type: 'none' as const, emoji: '○', label: '無反応' },
            ].map((r) => (
              <button key={r.type} onClick={() => recordReaction(r.type)}
                className="h-16 bg-white/20 hover:bg-white/30 rounded-xl text-2xl flex flex-col items-center justify-center gap-1">
                <span>{r.emoji}</span>
                <span className="text-sm font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          {reactionLog.length > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl p-3">
              <p className="text-sm text-teal-200 mb-2">記録済み反応 ({reactionLog.length}件)</p>
              <div className="flex flex-wrap gap-2">
                {reactionLog.map((r, i) => (
                  <span key={i} className="text-sm bg-white/20 px-2 py-1 rounded-lg">
                    {r.timestamp}秒: {r.reaction === 'smile' ? '😊' : r.reaction === 'talk' ? '💬' : r.reaction === 'tear' ? '😢' : '○'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 動画リスト */}
      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_VIDEOS.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-xl font-bold text-[#1F2937] mb-1">{video.title}</p>
            <p className="text-base text-gray-500 mb-1">{video.description}</p>
            <p className="text-base text-gray-400 mb-4">
              {video.era_decade}年代　反応記録: {video.reaction_log.length}件
            </p>
            <button onClick={() => startSession(video)}
              className="w-full h-14 bg-[#D97706] text-white text-lg font-bold rounded-xl hover:bg-amber-600">
              ▶ セッション開始
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
