import { createClient } from '@/lib/supabase/server'
import VideoPageClient from './VideoPageClient'
import type { Subject, VideoFile } from '@/lib/supabase/types'

export default async function VideoPage({
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

  const { data: videoFiles } = selectedSubject
    ? await supabase.from('video_files').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <VideoPageClient
      subjects={subjects as Subject[] || []}
      selectedSubject={selectedSubject}
      videoFiles={videoFiles as VideoFile[] || []}
    />
  )
}
