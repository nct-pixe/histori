'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Subject, MusicFile } from '@/lib/supabase/types'

const DEFAULT_TRACKS = [
  { id: 'furusato',       title: '故郷',           artist: '文部省唱歌', era: 1914 },
  { id: 'haru_no_ogawa',  title: '春の小川',        artist: '文部省唱歌', era: 1912 },
  { id: 'aka_tonbo',      title: '赤とんぼ',        artist: '三木露風',   era: 1921 },
  { id: 'umi',            title: '海',              artist: '文部省唱歌', era: 1913 },
  { id: 'yuyake_koyake',  title: 'ゆうやけこやけ',  artist: '中村雨紅',   era: 1923 },
  { id: 'shojoji',        title: '証城寺の狸囃子',  artist: '野口雨情',   era: 1924 },
  { id: 'donguri',        title: 'どんぐりころころ', artist: '青木存義',   era: 1921 },
  { id: 'momiji',         title: '紅葉',            artist: '文部省唱歌', era: 1911 },
  { id: 'hana',           title: '花',              artist: '武島羽衣',   era: 1900 },
  { id: 'sakura',         title: 'さくらさくら',    artist: '伝統曲',     era: 1888 },
]

interface Props {
  subjects: Subject[]
  selectedSubject?: Subject
  musicFiles: MusicFile[]
}

export default function MusicPageClient({ subjects, selectedSubject, musicFiles }: Props) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadArtist, setUploadArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

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

  async function handleReaction(fileId: string, currentScore: number) {
    await supabase.from('music_files').update({ reaction_score: currentScore + 1 }).eq('id', fileId)
  }

  async function handleUpload() {
    if (!uploadFile || !selectedSubject) return
    setUploading(true)
    const path = `music/${selectedSubject.id}/${Date.now()}_${uploadFile.name}`
    const { data, error } = await supabase.storage.from('media').upload(path, uploadFile)
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      await supabase.from('music_files').insert({
        subject_id: selectedSubject.id,
        title: uploadTitle || uploadFile.name,
        artist: uploadArtist || null,
        file_url: publicUrl,
      })
      setUploadFile(null)
      setUploadTitle('')
      setUploadArtist('')
      window.location.reload()
    }
    setUploading(false)
  }

  return (
    <div>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3A6B]">音楽療法セッション</h1>
          {selectedSubject && <p className="text-xl text-gray-500 mt-1">{selectedSubject.name} さんの音楽ライブラリ</p>}
        </div>
      </div>

      {subjects.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex gap-3 flex-wrap">
          {subjects.map((s) => (
            <Link key={s.id} href={`/music?subjectId=${s.id}`}
              className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${
                s.id === selectedSubject?.id ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {s.name} さん
            </Link>
          ))}
        </div>
      )}

      {/* 著作権フリー楽曲 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-4">🎵 収録楽曲（唱歌・童謡）</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {DEFAULT_TRACKS.map((track) => {
            const isPlaying = playing === track.id
            return (
              <div key={track.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <button
                  onClick={() => playTrack(`/music/${track.id}.mp3`, track.id)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                    isPlaying ? 'bg-[#0D9488] text-white' : 'bg-[#1B3A6B] text-white hover:bg-[#162d54]'
                  }`}
                >
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

      {/* 音量コントロール */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 flex items-center gap-4">
        <span className="text-2xl">🔊</span>
        <input
          type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[#0D9488] h-3 cursor-pointer"
        />
        <span className="text-lg font-medium w-12 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* ユーザーアップロード楽曲 */}
      {selectedSubject && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-4">📂 マイ楽曲ライブラリ</h2>
          {musicFiles.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 mb-6">
              {musicFiles.map((file) => {
                const isPlaying = playing === file.id
                return (
                  <div key={file.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <button
                      onClick={() => playTrack(file.file_url, file.id)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
                        isPlaying ? 'bg-[#0D9488] text-white' : 'bg-[#D97706] text-white hover:bg-amber-600'
                      }`}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <div className="flex-1">
                      <p className="text-xl font-bold text-[#1F2937]">{file.title}</p>
                      {file.artist && <p className="text-base text-gray-500">{file.artist}</p>}
                      <p className="text-base text-[#0D9488]">反応スコア: {file.reaction_score}</p>
                    </div>
                    <button
                      onClick={() => handleReaction(file.id, file.reaction_score)}
                      className="h-14 px-4 bg-amber-50 text-amber-600 text-base font-bold rounded-xl hover:bg-amber-100"
                    >
                      👍 反応あり
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-lg text-gray-500 mb-4">まだ楽曲が登録されていません</p>
          )}

          {/* アップロードフォーム */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#1F2937]">楽曲をアップロード</h3>
            <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
              placeholder="曲名（省略するとファイル名になります）" />
            <input type="text" value={uploadArtist} onChange={(e) => setUploadArtist(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
              placeholder="アーティスト名（任意）" />
            <input type="file" accept="audio/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg" />
            <button
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="w-full h-14 bg-[#0D9488] text-white text-lg font-bold rounded-xl disabled:opacity-50 hover:bg-teal-700"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
