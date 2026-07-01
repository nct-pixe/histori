import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_BUCKETS = ['album-photos', 'music-files', 'video-files']

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
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'invalid bucket' }, { status: 400 })
  }

  // ログイン確認はユーザーセッションで行い、実アップロードは RLS を回避する service role で行う
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: publicUrl, path: data.path })
}
