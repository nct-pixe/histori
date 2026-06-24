import { createClient } from '@/lib/supabase/server'
import MusicPageClient from './MusicPageClient'
import type { Subject, MusicFile } from '@/lib/supabase/types'

export default async function MusicPage({
  searchParams,
}: {
  searchParams: Promise<{ subjectId?: string }>
}) {
  const { subjectId } = await searchParams
  const supabase = await createClient()

  const { data: subjects } = await supabase.from('subjects').select('*').order('created_at', { ascending: false })
  const selectedSubject = subjectId
    ? (subjects as Subject[])?.find((s) => s.id === subjectId)
    : (subjects as Subject[])?.[0]

  const { data: musicFiles } = selectedSubject
    ? await supabase.from('music_files').select('*').eq('subject_id', selectedSubject.id).order('reaction_score', { ascending: false })
    : { data: [] }

  return (
    <MusicPageClient
      subjects={subjects as Subject[] || []}
      selectedSubject={selectedSubject}
      musicFiles={musicFiles as MusicFile[] || []}
    />
  )
}
