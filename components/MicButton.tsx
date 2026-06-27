'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  onResult: (text: string) => void
  className?: string
}

export default function MicButton({ onResult, className = '' }: Props) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  function toggleListen() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition: SpeechRecognition = new SR()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript
      onResult(text)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={toggleListen}
      title={listening ? '音声入力中（タップで停止）' : '音声入力'}
      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
    >
      🎤
    </button>
  )
}
