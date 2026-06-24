import { DEMO_SUBJECT } from '@/lib/demo/mockData'
import { selectQuestions } from '@/lib/questions/selector'
import type { LifeStage } from '@/lib/supabase/types'
import DemoSessionClient from './DemoSessionClient'

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

export default async function DemoSessionStage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lifeStage = id as LifeStage
  const questions = selectQuestions(DEMO_SUBJECT, lifeStage, 8)

  return (
    <DemoSessionClient
      subject={DEMO_SUBJECT}
      lifeStage={lifeStage}
      stageLabel={STAGE_LABELS[lifeStage] || lifeStage}
      questions={questions}
    />
  )
}
