import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { AlbumPDF } from '@/lib/pdf/generator'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'
// Vercel Hobby の 10 秒制限を回避するため最大 60 秒に設定
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const albumId = request.nextUrl.searchParams.get('albumId')
  if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: album } = await supabase.from('albums').select('*').eq('id', albumId).single()
  if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })

  const { data: pages } = await supabase
    .from('album_pages')
    .select('*')
    .eq('album_id', albumId)
    .order('page_number')

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', (album as Album).subject_id)
    .single()

  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

  const element = React.createElement(AlbumPDF, {
    album: album as Album,
    pages: (pages as AlbumPage[]) || [],
    subject: subject as Subject,
  })

  // @react-pdf/renderer v4 API: pdf().toBuffer() → ReadableStream → Buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await pdf(element as any).toBuffer()
  const chunks: Buffer[] = []
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)

  const filename = encodeURIComponent(`${(album as Album).title}.pdf`)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
