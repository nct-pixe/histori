'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Subject, MusicFile } from '@/lib/supabase/types'

const DEFAULT_TRACKS = [
  { id: 'furusato',      title: '故郷',            artist: '文部省唱歌', era: 1914 },
  { id: 'haru_no_ogawa', title: '春の小川',         artist: '文部省唱歌', era: 1912 },
  { id: 'aka_tonbo',     title: '赤とんぼ',         artist: '三木露風',   era: 1921 },
  { id: 'umi',           title: '海',               artist: '文部省唱歌', era: 1913 },
  { id: 'yuyake_koyake', title: 'ゆうやけこやけ',   artist: '中村雨紅',   era: 1923 },
  { id: 'shojoji',       title: '証城寺の狸囃子',   artist: '野口雨情',   era: 1924 },
  { id: 'donguri',       title: 'どんぐりころころ',  artist: '青木存義',   era: 1921 },
  { id: 'momiji',        title: '紅葉',             artist: '文部省唱歌', era: 1911 },
  { id: 'hana',          title: '花',               artist: '武島羽衣',   era: 1900 },
  { id: 'sakura',        title: 'さくらさくら',     artist: '伝統曲',     era: 1888 },
]

interface Props {
  subjects: Subject[]
  selectedSubject?: Subject
  musicFiles: MusicFile[]
}

export default function MusicPageClient({ subjects, selectedSubject }: Props) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  function playTrack(url: string, id: string) {
    if (playing === id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.volume = volume
      audioRef.current.play()
      setPlaying(id)
    }
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>MUSIC</p>
          <h1 className="text-4xl font-bold" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>音楽療法セッション</h1>
          {selectedSubject && <p className="text-base mt-1" style={{ color: '#64748B' }}>{selectedSubject.name} さんの音楽ライブラリ</p>}
        </div>
      </div>

      {/* 主人公切替 */}
      {subjects.length > 1 && (
        <div className="bg-white rounded-2xl p-4 mb-6 flex gap-2 flex-wrap" style={{ border: '1px solid #E2E8F0' }}>
          {subjects.map((s) => (
            <Link key={s.id} href={`/music?subjectId=${s.id}`}
              className="px-5 py-2.5 rounded-full text-base font-medium transition-colors"
              style={s.id === selectedSubject?.id ? { background: '#1B3A6B', color: 'white' } : { background: '#F1F5F9', color: '#475569' }}>
              {s.name} さん
            </Link>
          ))}
        </div>
      )}

      {/* 音量コントロール */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ border: '1px solid #E2E8F0' }}>
        <span className="text-xl">🔊</span>
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 cursor-pointer" style={{ accentColor: '#0D9488' }} />
        <span className="text-sm font-medium w-10 text-right" style={{ color: '#64748B' }}>{Math.round(volume * 100)}%</span>
      </div>

      {/* 収録楽曲 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>🎵 収録楽曲（唱歌・童謡）</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DEFAULT_TRACKS.map((track) => {
            const isPlaying = playing === track.id
            return (
              <div key={track.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 transition-shadow hover:shadow-sm"
                style={{ border: '1px solid #E2E8F0' }}>
                <button
                  onClick={() => playTrack(`/music/${track.id}.mp3`, track.id)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                  style={{ background: isPlaying ? '#0D9488' : '#1B3A6B' }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{track.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{track.artist}　{track.era}年</p>
                </div>
                {isPlaying && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#F0FDF4', color: '#0D9488' }}>再生中</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
