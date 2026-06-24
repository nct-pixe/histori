'use client'

import { useState, useRef, useEffect } from 'react'
import { DEMO_SUBJECT, DEMO_MUSIC } from '@/lib/demo/mockData'

const DEFAULT_TRACKS = [
  { id: 'furusato',      title: '故郷',           artist: '文部省唱歌', era: 1914 },
  { id: 'haru_no_ogawa', title: '春の小川',        artist: '文部省唱歌', era: 1912 },
  { id: 'aka_tonbo',     title: '赤とんぼ',        artist: '三木露風',   era: 1921 },
  { id: 'umi',           title: '海',              artist: '文部省唱歌', era: 1913 },
  { id: 'yuyake_koyake', title: 'ゆうやけこやけ',  artist: '中村雨紅',   era: 1923 },
  { id: 'shojoji',       title: '証城寺の狸囃子',  artist: '野口雨情',   era: 1924 },
  { id: 'donguri',       title: 'どんぐりころころ', artist: '青木存義',   era: 1921 },
  { id: 'momiji',        title: '紅葉',            artist: '文部省唱歌', era: 1911 },
  { id: 'hana',          title: '花',              artist: '武島羽衣',   era: 1900 },
  { id: 'sakura',        title: 'さくらさくら',    artist: '伝統曲',     era: 1888 },
]

export default function DemoMusicPage() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [reactions, setReactions] = useState<Record<string, number>>(
    Object.fromEntries(DEMO_MUSIC.map((m) => [m.id, m.reaction_score]))
  )
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
      audioRef.current.play().catch(() => {})
      setPlaying(id)
    }
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">音楽療法セッション</h1>
      <p className="text-xl text-gray-500 mb-8">{DEMO_SUBJECT.name} さんの音楽ライブラリ</p>

      {/* 著作権フリー楽曲 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-4">🎵 収録楽曲（唱歌・童謡）</h2>
        <p className="text-base text-amber-600 bg-amber-50 rounded-xl p-3 mb-4">
          ※ デモモードでは実際の音楽ファイルが必要です。`public/music/` にMP3を配置すると再生できます。
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {DEFAULT_TRACKS.map((track) => {
            const isPlaying = playing === track.id
            return (
              <div key={track.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <button onClick={() => playTrack(`/music/${track.id}.mp3`, track.id)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                    isPlaying ? 'bg-[#0D9488] text-white' : 'bg-[#1B3A6B] text-white hover:bg-[#162d54]'
                  }`}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="flex-1">
                  <p className="text-xl font-bold text-[#1F2937]">{track.title}</p>
                  <p className="text-base text-gray-500">{track.artist}　{track.era}年</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 音量 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 flex items-center gap-4">
        <span className="text-2xl">🔊</span>
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[#0D9488] h-3 cursor-pointer" />
        <span className="text-lg font-medium w-12 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* マイライブラリ（デモデータ） */}
      <section>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-4">📂 {DEMO_SUBJECT.name} さんの楽曲</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DEMO_MUSIC.map((file) => (
            <div key={file.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🎵</div>
              <div className="flex-1">
                <p className="text-xl font-bold text-[#1F2937]">{file.title}</p>
                <p className="text-base text-gray-500">{file.artist}　{file.era_decade}年代</p>
                <p className="text-base text-[#0D9488]">反応スコア: {reactions[file.id]}</p>
              </div>
              <button onClick={() => setReactions((prev) => ({ ...prev, [file.id]: prev[file.id] + 1 }))}
                className="h-14 px-4 bg-amber-50 text-amber-600 text-base font-bold rounded-xl hover:bg-amber-100">
                👍 反応あり
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
