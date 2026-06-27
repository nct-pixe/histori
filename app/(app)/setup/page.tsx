'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CareLevel, SessionGoal } from '@/lib/supabase/types'
import MicButton from '@/components/MicButton'

type Step = 'name' | 'profile' | 'careLevel' | 'goal' | 'consent' | 'done'

interface FormData {
  name: string
  birth_year: string
  birth_region: string
  career: string
  hobbies: string
  family_structure: string
  music_preference: string
  care_level: CareLevel
  session_goal: SessionGoal
}

const initialForm: FormData = {
  name: '', birth_year: '', birth_region: '', career: '',
  hobbies: '', family_structure: '', music_preference: '',
  care_level: 2, session_goal: 'all',
}

const STEPS: Step[] = ['name', 'profile', 'careLevel', 'goal', 'consent', 'done']

const inputStyle = {
  border: '1.5px solid #E2E8F0',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '1rem',
  color: '#1F2937',
  outline: 'none',
  width: '100%',
}

export default function SetupPage() {
  const [step, setStep] = useState<Step>('name')
  const [form, setForm] = useState<FormData>(initialForm)
  const [consentChecked, setConsentChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const stepIndex = STEPS.indexOf(step)
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100)

  function update(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setSubmitError('')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        window.location.href = '/login'
        return
      }
      await supabase.from('profiles').upsert({ id: user.id, mode: 'family' }, { onConflict: 'id' })
      const { data, error } = await supabase.from('subjects').insert({
        user_id: user.id,
        name: form.name,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        birth_region: form.birth_region || null,
        career: form.career || null,
        hobbies: form.hobbies || null,
        family_structure: form.family_structure || null,
        music_preference: form.music_preference || null,
        care_level: form.care_level,
        session_goal: form.session_goal,
        consent_agreed_at: consentChecked ? new Date().toISOString() : null,
      }).select().single()
      if (error) { setSubmitError(`登録エラー: ${error.message}`); setLoading(false); return }
      if (data) setStep('done')
    } catch (e: any) {
      setSubmitError(`予期しないエラー: ${e?.message ?? '不明'}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest mb-1" style={{ color: '#0D9488' }}>SETUP</p>
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>主人公のプロフィール登録</h1>
        <div className="w-full rounded-full h-1.5" style={{ background: '#E2E8F0' }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: '#0D9488' }} />
        </div>
        <p className="text-sm mt-1.5" style={{ color: '#94A3B8' }}>ステップ {stepIndex + 1} / {STEPS.length}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #E2E8F0' }}>
        {step === 'name' && <StepName form={form} update={update} onNext={() => setStep('profile')} />}
        {step === 'profile' && <StepProfile form={form} update={update} onNext={() => setStep('careLevel')} onBack={() => setStep('name')} />}
        {step === 'careLevel' && <StepCareLevel form={form} update={update} onNext={() => setStep('goal')} onBack={() => setStep('profile')} />}
        {step === 'goal' && <StepGoal form={form} update={update} onNext={() => setStep('consent')} onBack={() => setStep('careLevel')} />}
        {step === 'consent' && (
          <StepConsent checked={consentChecked} onCheck={setConsentChecked} onNext={handleSubmit} onBack={() => setStep('goal')} loading={loading} error={submitError} />
        )}
        {step === 'done' && <StepDone name={form.name} router={router} />}
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = '次へ', nextDisabled = false }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button onClick={onBack} className="flex-1 py-3.5 rounded-full text-base font-bold transition-opacity hover:opacity-80"
          style={{ background: '#F1F5F9', color: '#475569' }}>
          戻る
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="flex-1 py-3.5 rounded-full text-base font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ background: '#1B3A6B' }}>
          {nextLabel}
        </button>
      )}
    </div>
  )
}

function StepName({ form, update, onNext }: { form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>主人公のお名前</h2>
        <p className="text-sm" style={{ color: '#64748B' }}>回想法の対象となる方のお名前を入力してください</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>お名前（フルネーム）</label>
        <div className="flex gap-2">
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            style={inputStyle} placeholder="例：田中 花子"
            onFocus={(e) => e.target.style.borderColor = '#0D9488'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
          <MicButton onResult={(text) => update('name', form.name + text)} />
        </div>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!form.name.trim()} />
    </div>
  )
}

function StepProfile({ form, update, onNext, onBack }: { form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void; onBack: () => void }) {
  const fields = [
    { field: 'birth_year' as const, label: '生まれた年', placeholder: '例：1935', type: 'number' },
    { field: 'birth_region' as const, label: '出身地・育った場所', placeholder: '例：青森県弘前市' },
    { field: 'career' as const, label: 'お仕事・職歴', placeholder: '例：農業、教師、会社員' },
    { field: 'hobbies' as const, label: '趣味・好きなこと', placeholder: '例：庭仕事、演歌鑑賞、将棋' },
    { field: 'family_structure' as const, label: '家族構成', placeholder: '例：息子2人、娘1人' },
    { field: 'music_preference' as const, label: '好きな音楽・歌手', placeholder: '例：演歌、美空ひばり' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>基本プロフィール</h2>
        <p className="text-sm" style={{ color: '#64748B' }}>わかる範囲で入力してください（すべて任意）</p>
      </div>
      {fields.map(({ field, label, placeholder, type }) => (
        <div key={field}>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>{label}</label>
          <div className="flex gap-2">
            <input type={type || 'text'} value={form[field] as string} onChange={(e) => update(field, e.target.value)}
              style={inputStyle} placeholder={placeholder}
              onFocus={(e) => e.target.style.borderColor = '#0D9488'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
            {type !== 'number' && <MicButton onResult={(text) => update(field, (form[field] as string) + text)} />}
          </div>
        </div>
      ))}
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepCareLevel({ form, update, onNext, onBack }: { form: FormData; update: (f: keyof FormData, v: number) => void; onNext: () => void; onBack: () => void }) {
  const levels = [
    { value: 1, label: '軽度', desc: '会話・理解は良好。詳しい質問にも答えられる', color: '#3B82F6' },
    { value: 2, label: '中度', desc: '簡単な質問なら答えられる。写真や音楽が助けになる', color: '#F59E0B' },
    { value: 3, label: '重度', desc: '短い言葉やうなずきが主。感情・反応を大切にする', color: '#EF4444' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>認知症の程度</h2>
        <p className="text-sm" style={{ color: '#64748B' }}>質問の難易度を自動調整するために使います</p>
      </div>
      <div className="space-y-3">
        {levels.map((l) => (
          <button key={l.value} onClick={() => update('care_level', l.value)}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
              border: form.care_level === l.value ? `2px solid ${l.color}` : '1.5px solid #E2E8F0',
              background: form.care_level === l.value ? '#F8FAFC' : 'white',
            }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-base font-bold" style={{ color: '#1B3A6B' }}>{l.label}</span>
            </div>
            <p className="text-sm mt-1 ml-4" style={{ color: '#64748B' }}>{l.desc}</p>
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepGoal({ form, update, onNext, onBack }: { form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void; onBack: () => void }) {
  const goals = [
    { value: 'care', label: '回想法ケア', desc: '聴き取りを通じたコミュニケーションとケア', emoji: '💬' },
    { value: 'album', label: 'アルバム作成', desc: '人生の記録を写真入りアルバムにまとめる', emoji: '📔' },
    { value: 'music', label: '音楽療法', desc: '懐かしい音楽を通じた感情・記憶の刺激', emoji: '🎵' },
    { value: 'video', label: '動画回想', desc: '映像を見ながら思い出を語り合う', emoji: '🎬' },
    { value: 'all', label: 'すべて', desc: '上記のすべての機能を活用する', emoji: '✨' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>利用目的</h2>
        <p className="text-sm" style={{ color: '#64748B' }}>主な使い方を選んでください</p>
      </div>
      <div className="space-y-2">
        {goals.map((g) => (
          <button key={g.value} onClick={() => update('session_goal', g.value)}
            className="w-full p-4 rounded-xl text-left transition-all flex items-center gap-3"
            style={{
              border: form.session_goal === g.value ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
              background: form.session_goal === g.value ? '#F0FDF4' : 'white',
            }}>
            <span className="text-xl">{g.emoji}</span>
            <div>
              <div className="text-base font-bold" style={{ color: '#1B3A6B' }}>{g.label}</div>
              <div className="text-sm" style={{ color: '#64748B' }}>{g.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

function StepConsent({ checked, onCheck, onNext, onBack, loading, error }: {
  checked: boolean; onCheck: (v: boolean) => void; onNext: () => void; onBack: () => void; loading: boolean; error?: string
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>同意書の確認</h2>
        <p className="text-sm" style={{ color: '#64748B' }}>以下をお読みの上、同意してください</p>
      </div>
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{error}</div>
      )}
      <div className="rounded-xl p-5 text-sm space-y-3 max-h-56 overflow-y-auto" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#374151' }}>
        <p className="font-bold">個人情報の取り扱いについて</p>
        <p>本アプリに入力された個人情報・回想内容は、回想法セッションの実施およびアルバム作成のみを目的として使用します。</p>
        <p>データはSupabase（クラウドデータベース・米国サーバー）に暗号化して保存されます。第三者への提供は行いません。</p>
        <p>データの削除はいつでも設定画面から行うことができます。</p>
        <p>回想法セッションは、認知症の治療を目的とするものではなく、生活の質の向上を目的とした非薬物的アプローチです。</p>
        <div className="pt-3 mt-1" style={{ borderTop: '1px solid #E2E8F0' }}>
          <p className="font-bold mb-1">運営者情報</p>
          <p>会社名：NEURO CARE TECH株式会社</p>
          <p>【本社】〒526-0834 滋賀県長浜市大辰巳町36番地1階</p>
          <p>【東京オフィス】〒107-0062 東京都港区南青山3-1-36 6F</p>
          <p>【仙台オフィス】〒984-0053 宮城県仙台市若林区連坊小路127 2F</p>
          <p>お問い合わせ：info@nct-net.com</p>
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} className="w-5 h-5 accent-teal-600" />
        <span className="text-base" style={{ color: '#374151' }}>上記の内容を確認し、同意します</span>
      </label>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel={loading ? '登録中...' : '登録する'} nextDisabled={!checked || loading} />
    </div>
  )
}

function StepDone({ name, router }: { name: string; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl" style={{ background: '#F0FDF4' }}>🎉</div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B3A6B', fontFamily: 'serif' }}>{name} さんを登録しました</h2>
        <p className="text-base" style={{ color: '#64748B' }}>さっそく回想法セッションを始めましょう</p>
      </div>
      <div className="space-y-3">
        <button onClick={() => router.push('/session')}
          className="w-full py-4 rounded-full text-base font-bold text-white hover:opacity-90"
          style={{ background: '#1B3A6B' }}>
          セッションを始める
        </button>
        <button onClick={() => router.push('/dashboard')}
          className="w-full py-4 rounded-full text-base font-bold hover:opacity-80"
          style={{ background: '#F1F5F9', color: '#475569' }}>
          ホームに戻る
        </button>
      </div>
    </div>
  )
}
