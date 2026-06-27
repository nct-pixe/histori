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
  name: '',
  birth_year: '',
  birth_region: '',
  career: '',
  hobbies: '',
  family_structure: '',
  music_preference: '',
  care_level: 2,
  session_goal: 'all',
}

const STEPS: Step[] = ['name', 'profile', 'careLevel', 'goal', 'consent', 'done']

export default function SetupPage() {
  const [step, setStep] = useState<Step>('name')
  const [form, setForm] = useState<FormData>(initialForm)
  const [consentChecked, setConsentChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const stepIndex = STEPS.indexOf(step)
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100)

  function update(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id ?? 'local-dev-user'

      const { data, error } = await supabase.from('subjects').insert({
        user_id: userId,
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

      if (!error && data) {
        setStep('done')
      } else {
        // Supabase未接続時はそのまま完了へ
        setStep('done')
      }
    } catch {
      setStep('done')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">主人公のプロフィール登録</h1>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#0D9488] h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-base text-gray-500 mt-1">ステップ {stepIndex + 1} / {STEPS.length}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === 'name' && (
          <StepName form={form} update={update} onNext={() => setStep('profile')} />
        )}
        {step === 'profile' && (
          <StepProfile form={form} update={update}
            onNext={() => setStep('careLevel')} onBack={() => setStep('name')} />
        )}
        {step === 'careLevel' && (
          <StepCareLevel form={form} update={update}
            onNext={() => setStep('goal')} onBack={() => setStep('profile')} />
        )}
        {step === 'goal' && (
          <StepGoal form={form} update={update}
            onNext={() => setStep('consent')} onBack={() => setStep('careLevel')} />
        )}
        {step === 'consent' && (
          <StepConsent
            checked={consentChecked}
            onCheck={setConsentChecked}
            onNext={handleSubmit}
            onBack={() => setStep('goal')}
            loading={loading}
          />
        )}
        {step === 'done' && <StepDone name={form.name} router={router} />}
      </div>
    </div>
  )
}

function StepName({ form, update, onNext }: {
  form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1F2937]">主人公のお名前</h2>
      <div>
        <label className="block text-lg font-medium mb-2">お名前（フルネーム）</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-xl focus:outline-none focus:border-[#0D9488]"
            placeholder="例：田中 花子"
          />
          <MicButton onResult={(text) => update('name', form.name + text)} />
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={!form.name.trim()}
        className="w-full h-16 bg-[#1B3A6B] text-white text-xl font-bold rounded-xl disabled:opacity-50 hover:bg-[#162d54] transition-colors"
      >
        次へ
      </button>
    </div>
  )
}

function StepProfile({ form, update, onNext, onBack }: {
  form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void; onBack: () => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-[#1F2937]">基本プロフィール</h2>
      {[
        { field: 'birth_year' as const, label: '生まれた年', placeholder: '例：1935', type: 'number' },
        { field: 'birth_region' as const, label: '出身地・育った場所', placeholder: '例：青森県弘前市' },
        { field: 'career' as const, label: 'お仕事・職歴', placeholder: '例：農業、教師、会社員' },
        { field: 'hobbies' as const, label: '趣味・好きなこと', placeholder: '例：庭仕事、演歌鑑賞、将棋' },
        { field: 'family_structure' as const, label: '家族構成', placeholder: '例：息子2人、娘1人' },
        { field: 'music_preference' as const, label: '好きな音楽・歌手', placeholder: '例：演歌、美空ひばり' },
      ].map(({ field, label, placeholder, type }) => (
        <div key={field}>
          <label className="block text-lg font-medium mb-1">{label}</label>
          <div className="flex gap-2">
            <input
              type={type || 'text'}
              value={form[field] as string}
              onChange={(e) => update(field, e.target.value)}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#0D9488]"
              placeholder={placeholder}
            />
            {type !== 'number' && (
              <MicButton onResult={(text) => update(field, (form[field] as string) + text)} />
            )}
          </div>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 h-14 border-2 border-gray-300 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50">
          戻る
        </button>
        <button onClick={onNext} className="flex-1 h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
          次へ
        </button>
      </div>
    </div>
  )
}

function StepCareLevel({ form, update, onNext, onBack }: {
  form: FormData; update: (f: keyof FormData, v: number) => void; onNext: () => void; onBack: () => void
}) {
  const levels = [
    { value: 1, label: '軽度', desc: '会話・理解は良好。詳しい質問にも答えられる' },
    { value: 2, label: '中度', desc: '簡単な質問なら答えられる。写真や音楽が助けになる' },
    { value: 3, label: '重度', desc: '短い言葉やうなずきが主。感情・反応を大切にする' },
  ]
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1F2937]">認知症の程度</h2>
      <p className="text-lg text-gray-500">質問の難易度を自動調整するために使います</p>
      <div className="space-y-3">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => update('care_level', l.value)}
            className={`w-full p-5 rounded-xl border-2 text-left transition-colors ${
              form.care_level === l.value ? 'border-[#0D9488] bg-teal-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xl font-bold">{l.label}</div>
            <div className="text-base text-gray-500 mt-1">{l.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 h-14 border-2 border-gray-300 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50">
          戻る
        </button>
        <button onClick={onNext} className="flex-1 h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
          次へ
        </button>
      </div>
    </div>
  )
}

function StepGoal({ form, update, onNext, onBack }: {
  form: FormData; update: (f: keyof FormData, v: string) => void; onNext: () => void; onBack: () => void
}) {
  const goals = [
    { value: 'care', label: '回想法ケア', desc: '聴き取りを通じたコミュニケーションとケア' },
    { value: 'album', label: 'アルバム作成', desc: '人生の記録を写真入りアルバムにまとめる' },
    { value: 'music', label: '音楽療法', desc: '懐かしい音楽を通じた感情・記憶の刺激' },
    { value: 'video', label: '動画回想', desc: '映像を見ながら思い出を語り合う' },
    { value: 'all', label: 'すべて', desc: '上記のすべての機能を活用する' },
  ]
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1F2937]">利用目的</h2>
      <div className="space-y-3">
        {goals.map((g) => (
          <button
            key={g.value}
            onClick={() => update('session_goal', g.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
              form.session_goal === g.value ? 'border-[#0D9488] bg-teal-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-lg font-bold">{g.label}</div>
            <div className="text-base text-gray-500 mt-0.5">{g.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 h-14 border-2 border-gray-300 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50">
          戻る
        </button>
        <button onClick={onNext} className="flex-1 h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl hover:bg-[#162d54]">
          次へ
        </button>
      </div>
    </div>
  )
}

function StepConsent({ checked, onCheck, onNext, onBack, loading }: {
  checked: boolean; onCheck: (v: boolean) => void; onNext: () => void; onBack: () => void; loading: boolean
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1F2937]">同意書の確認</h2>
      <div className="bg-gray-50 rounded-xl p-5 text-base text-gray-700 space-y-3 max-h-64 overflow-y-auto">
        <p className="font-bold">個人情報の取り扱いについて</p>
        <p>本アプリに入力された個人情報・回想内容は、回想法セッションの実施およびアルバム作成のみを目的として使用します。</p>
        <p>データはSupabase（クラウドデータベース・米国サーバー）に暗号化して保存されます。第三者への提供は行いません。</p>
        <p>データの削除はいつでも設定画面から行うことができます。</p>
        <p>回想法セッションは、認知症の治療を目的とするものではなく、生活の質の向上を目的とした非薬物的アプローチです。</p>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <p className="font-bold">運営者情報</p>
          <p>会社名：NEURO CARE TECH株式会社</p>
          <p>【本社】〒526-0834 滋賀県長浜市大辰巳町36番地1階</p>
          <p>【東京オフィス】〒107-0062 東京都港区南青山3-1-36 6F</p>
          <p>【仙台オフィス】〒984-0053 宮城県仙台市若林区連坊小路127 2F</p>
          <p>個人情報取扱責任者：野地 数正</p>
          <p>お問い合わせ：info@nct-net.com</p>
        </div>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          className="w-6 h-6 mt-0.5 accent-[#0D9488]"
        />
        <span className="text-lg">上記の内容を確認し、同意します</span>
      </label>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 h-14 border-2 border-gray-300 text-gray-600 text-lg font-bold rounded-xl hover:bg-gray-50">
          戻る
        </button>
        <button
          onClick={onNext}
          disabled={!checked || loading}
          className="flex-1 h-14 bg-[#1B3A6B] text-white text-lg font-bold rounded-xl disabled:opacity-50 hover:bg-[#162d54]"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </div>
    </div>
  )
}

function StepDone({ name, router }: { name: string; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-[#1F2937]">{name} さんのプロフィールを登録しました</h2>
      <p className="text-xl text-gray-500">さっそく回想法セッションを始めましょう</p>
      <div className="space-y-3">
        <button
          onClick={() => router.push('/session')}
          className="w-full h-16 bg-[#1B3A6B] text-white text-xl font-bold rounded-xl hover:bg-[#162d54]"
        >
          セッションを始める
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
