import { questions, Question, LifeStage, DifficultyLevel } from './bank'
import type { Subject } from '@/lib/supabase/types'

export function selectQuestions(
  subject: Partial<Subject>,
  lifeStage: LifeStage,
  count = 8
): Question[] {
  const careLevel = subject.care_level ?? 2
  const maxDifficulty: DifficultyLevel = careLevel === 3 ? 1 : careLevel === 2 ? 2 : 3

  const pool = questions.filter(
    (q) =>
      q.lifeStage === lifeStage &&
      q.difficulty <= maxDifficulty &&
      q.category !== 'music_induced' &&
      q.category !== 'video_induced'
  )

  // opener を先に、deepdive・integration を後に
  const openers = pool.filter((q) => q.category === 'opener')
  const others = pool.filter((q) => q.category !== 'opener')

  const sorted = [...shuffle(openers), ...shuffle(others)]
  return sorted.slice(0, count)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
