import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = (formData.get('bucket') as string) || 'media'
  const path = formData.get('path') as string

  if (!file || !path) {
    return NextResponse.json({ error: 'file and path required' }, { status: 400 })
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: publicUrl, path: data.path })
}
