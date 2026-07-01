import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'
import AlbumPreviewClient from './AlbumPreviewClient'

export default async function AlbumPreviewPage({
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

  return (
    <AlbumPreviewClient
      id={id}
      album={album as Album}
      pages={(pages as AlbumPage[]) || []}
      subject={subject as Subject | null}
    />
  )
}
