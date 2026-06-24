import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AlbumEditClient from './AlbumEditClient'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

export default async function AlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: album } = await supabase.from('albums').select('*').eq('id', id).single()
  if (!album) redirect('/album')

  const { data: pages } = await supabase
    .from('album_pages')
    .select('*')
    .eq('album_id', id)
    .order('page_number')

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', (album as Album).subject_id)
    .single()

  const { data: answers } = await supabase
    .from('answers')
    .select('*, sessions(life_stage)')
    .in(
      'session_id',
      (
        await supabase
          .from('sessions')
          .select('id')
          .eq('subject_id', (album as Album).subject_id)
      ).data?.map((s) => s.id) ?? []
    )
    .order('created_at')

  return (
    <AlbumEditClient
      album={album as Album}
      pages={(pages as AlbumPage[]) || []}
      subject={subject as Subject}
      answers={answers || []}
    />
  )
}
