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

export default function VideoPageClient({ subjects, selectedSubject, videoFiles }: Props) {
  const [activeVideo, setActiveVideo] = useState<VideoFile | null>(null)
  const [timeLeft, setTimeLeft] = useState(SESSION_MINUTES * 60)
  const [sessionActive, setSessionActive] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            setSessionActive(false)
            return 0
          }
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

  async function handleUpload() {
    if (!uploadFile || !selectedSubject) return
    setUploading(true)
    const path = `video/${selectedSubject.id}/${Date.now()}_${uploadFile.name}`
    const { data, error } = await supabase.storage.from('media').upload(path, uploadFile)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      await supabase.from('video_files').insert({
        subject_id: selectedSubject.id,
        title: uploadTitle || uploadFile.name,
        file_url: publicUrl,
      })
      setUploadFile(null)
      setUploadTitle('')
      window.location.reload()
    }
    setUploading(false)
  }

  const isAlert = timeLeft <= 300 && timeLeft > 0 && sessionActive

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">動画回想セッション</h1>
      {selectedSubject && <p className="text-xl text-gray-500 mb-8">{selectedSubject.name} さんの動画ライブラリ</p>}

      {subjects.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex gap-3 flex-wrap">
          {subjects.map((s) => (
            <Link key={s.id} href={`/video?subjectId=${s.id}`}
              className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
                s.id === selectedSubject?.id ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {s.name} さん
            </Link>
          ))}
        </div>
      )}

      {/* セッション中 */}
      {activeVideo && (
        <div className="bg-[#1B3A6B] rounded-2xl p-6 mb-8 text-white">
          <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${isAlert ? 'bg-red-500 animate-pulse' : 'bg-[#162d54]'}`}>
            <span className="text-xl font-bold">⏱ セッション残り時間</span>
            <span className="text-3xl font-bold font-mono">{formatTime(timeLeft)}</span>
            <button onClick={() => { setSessionActive(false); setActiveVideo(null) }}
              className="h-10 px-4 bg-white text-[#1B3A6B] text-base font-bold rounded-xl">
              終了
            </button>
          </div>

          <div className="bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={activeVideo.file_url}
              controls
              className="w-full max-h-72"
            />
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
        </div>
      )}

      {/* 動画リスト */}
      {videoFiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {videoFiles.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-xl font-bold text-[#1F2937] mb-1">{video.title}</p>
              {video.description && <p className="text-base text-gray-500 mb-3">{video.description}</p>}
              <p className="text-base text-gray-400 mb-4">
                反応記録: {(video.reaction_log || []).length} 件
              </p>
              <button
                onClick={() => startSession(video)}
                className="w-full h-14 bg-[#D97706] text-white text-lg font-bold rounded-xl hover:bg-amber-600"
              >
                ▶ セッション開始
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-500 mb-6">まだ動画がありません</p>
      )}

      {/* アップロード */}
      {selectedSubject && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-xl font-bold text-[#1F2937]">動画をアップロード</h3>
          <p className="text-base text-gray-500">MP4・MOV 形式に対応</p>
          <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
            placeholder="動画のタイトル" />
          <input type="file" accept="video/*"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg" />
          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            className="w-full h-14 bg-[#D97706] text-white text-lg font-bold rounded-xl disabled:opacity-50 hover:bg-amber-600"
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      )}
    </div>
  )
}
