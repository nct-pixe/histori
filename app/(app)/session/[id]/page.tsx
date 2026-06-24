import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionClient from './SessionClient'
import type { LifeStage } from '@/lib/supabase/types'
import { selectQuestions } from '@/lib/questions/selector'
import type { Subject } from '@/lib/supabase/types'

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { id } = await params
  const { subjectId } = await searchParams

  if (!subjectId) redirect('/session')

  const supabase = await createClient()
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .single()

  if (!subject) redirect('/session')

  const lifeStage = id as LifeStage
  const questions = selectQuestions(subject as Subject, lifeStage, 10)

  const { data: sessionData } = await supabase
    .from('sessions')
    .insert({
      subject_id: subjectId,
      life_stage: lifeStage,
    })
    .select()
    .single()

  return (
    <SessionClient
      subject={subject as Subject}
      lifeStage={lifeStage}
      stageLabel={STAGE_LABELS[lifeStage] || lifeStage}
      questions={questions}
      sessionId={sessionData?.id || ''}
    />
  )
}
