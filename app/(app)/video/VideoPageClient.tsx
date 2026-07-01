'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Subject, VideoFile, ReactionType } from '@/lib/supabase/types'

interface Props {
  subjects: Subject[]
  selectedSubject?: Subject
  videoFiles: VideoFile[]
}

const SESSION_MINUTES = 30

const inputStyle = {
  border: '1.5px solid #E2E8F0', borderRadius: '12px',
  padding: '10px 14px', fontSize: '1rem', color: '#1F2937', outline: 'none', width: '100%',
}

export default function VideoPageClient({ subjects, selectedSubject, videoFiles }: Props) {
  const [activeVideo, setActiveVideo] = useState<VideoFile | null>(null)
  const [timeLeft, setTimeLeft] = useState(SESSION_MINUTES * 60)
  const [sessionActive, setSessionActive] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); setSessionActive(false); return 0 }
          if (t === 300) alert('残り5分です')
          return t - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionActive])

  function startSession(video: VideoFile) {
    setActiveVideo(video)
    setTimeLeft(SESSION_MINUTES * 60)
    setSessionActive(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function recordReaction(reaction: ReactionType) {
    if (!activeVideo || !videoRef.current) return
    const timestamp = Math.floor(videoRef.current.currentTime)
    const newLog = [...(activeVideo.reaction_log || []), { timestamp, reaction }]
    await supabase.from('video_files').update({ reaction_log: newLog }).eq('id', activeVideo.id)
  }

  async function handleAddYoutube() {
    if (!youtubeUrl || !selectedSubject) return
    const videoId = extractYoutubeId(youtubeUrl)
    if (!videoId) { alert('正しいYouTubeのURLを入力してください'); return }
    setUploading(true)
    await supabase.from('video_files').insert({
      subject_id: selectedSubject.id,
      title: uploadTitle || 'YouTube動画',
      file_url: `https://www.youtube.com/embed/${videoId}`,
    })
    setYoutubeUrl(''); setUploadTitle(''); setUploading(false)
    window.location.reload()
  }

  const isAlert = timeLeft <= 300 && timeLeft > 0 && sessionActive

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>VIDEO</p>
          <h1 className="text-4xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>動画回想セッション</h1>
          {selectedSubject && <p className="text-base mt-1" style={{ color: '#64748B' }}>{selectedSubject.name} さんの動画ライブラリ</p>}
        </div>
      </div>

      {/* 主人公切替 */}
      {subjects.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 flex gap-2 flex-wrap" style={{ border: '1px solid #E2E8F0' }}>
          {subjects.map((s) => (
            <Link key={s.id} href={`/video?subjectId=${s.id}`}
              className="px-5 py-2.5 rounded-full text-base font-medium transition-colors"
              style={s.id === selectedSubject?.id ? { background: '#1B3A6B', color: 'white' } : { background: '#F1F5F9', color: '#475569' }}>
              {s.name} さん
            </Link>
          ))}
        </div>
      )}

      {/* セッション中パネル */}
      {activeVideo && (
        <div className="bg-white rounded-2xl mb-8 overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
          {/* タイマーバー */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ background: isAlert ? '#FEF2F2' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <div>
              <p className="text-xs font-semibold tracking-widest mb-0.5" style={{ color: isAlert ? '#DC2626' : '#0D9488' }}>SESSION TIMER</p>
              <span className="text-3xl font-bold font-mono" style={{ color: isAlert ? '#DC2626' : '#1B3A6B' }}>{formatTime(timeLeft)}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{activeVideo.title}</p>
              <button onClick={() => { setSessionActive(false); setActiveVideo(null) }}
                className="px-5 py-2 rounded-full text-sm font-bold text-white hover:opacity-90"
                style={{ background: '#94A3B8' }}>
                セッション終了
              </button>
            </div>
          </div>

          {/* 動画プレイヤー */}
          <div style={{ background: '#000' }}>
            {activeVideo.file_url.includes('youtube.com/embed') ? (
              <iframe src={activeVideo.file_url} className="w-full aspect-video" allowFullScreen />
            ) : (
              <video ref={videoRef} src={activeVideo.file_url} controls className="w-full aspect-video" />
            )}
          </div>

          {/* 反応ボタン */}
          <div className="p-6">
            <p className="text-sm font-semibold mb-3" style={{ color: '#64748B' }}>反応を記録する</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'smile' as const, emoji: '😊', label: '笑顔', bg: '#FEF3C7', color: '#92400E' },
                { type: 'talk' as const, emoji: '💬', label: '発話', bg: '#EFF6FF', color: '#1D4ED8' },
                { type: 'tear' as const, emoji: '😢', label: '涙', bg: '#F0FDF4', color: '#166534' },
                { type: 'none' as const, emoji: '○', label: '無反応', bg: '#F8FAFC', color: '#64748B' },
              ].map((r) => (
                <button key={r.type} onClick={() => recordReaction(r.type)}
                  className="py-4 rounded-2xl flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{ background: r.bg }}>
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: r.color }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 動画リスト */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>🎬 動画ライブラリ</h2>
        {videoFiles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {videoFiles.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
                style={{ border: '1px solid #E2E8F0' }}>
                {/* サムネイル */}
                <div className="aspect-video flex items-center justify-center text-5xl"
                  style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)' }}>
                  🎬
                </div>
                <div className="p-4">
                  <p className="text-base font-bold mb-1 truncate" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{video.title}</p>
                  {video.description && <p className="text-sm mb-2 line-clamp-2" style={{ color: '#64748B' }}>{video.description}</p>}
                  <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>反応記録: {(video.reaction_log || []).length} 件</p>
                  <button onClick={() => startSession(video)}
                    className="w-full py-3 rounded-full text-sm font-bold text-white hover:opacity-90"
                    style={{ background: '#D97706' }}>
                    ▶ セッション開始
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #E2E8F0' }}>
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-base" style={{ color: '#94A3B8' }}>まだ動画が登録されていません</p>
          </div>
        )}
      </section>

      {/* YouTube追加フォーム */}
      {selectedSubject && (
        <section>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>YouTube動画を追加</h2>
          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid #E2E8F0' }}>
            <p className="text-sm" style={{ color: '#64748B' }}>YouTubeのURLを貼り付けてください</p>
            <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
              style={inputStyle} placeholder="動画のタイトル"
              onFocus={(e) => e.target.style.borderColor = '#0D9488'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
            <input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
              style={inputStyle} placeholder="https://www.youtube.com/watch?v=..."
              onFocus={(e) => e.target.style.borderColor = '#0D9488'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
            <button onClick={handleAddYoutube} disabled={!youtubeUrl || uploading}
              className="w-full py-3.5 rounded-full text-base font-bold text-white disabled:opacity-50 hover:opacity-90"
              style={{ background: '#D97706' }}>
              {uploading ? '追加中...' : '動画を追加'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
