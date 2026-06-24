import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { AlbumPDF, SinglePagePDF } from '@/lib/pdf/generator'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function streamToBuffer(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const albumId = searchParams.get('albumId')
  const pageId  = searchParams.get('pageId')   // 単ページ印刷用（省略時は全ページ）

  if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: album } = await supabase.from('albums').select('*').eq('id', albumId).single()
  if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 })

  const { data: subject } = await supabase
    .from('subjects').select('*').eq('id', (album as Album).subject_id).single()
  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

  let element: React.ReactElement
  let filename: string

  if (pageId) {
    // ── 単ページ PDF ──
    const { data: page } = await supabase
      .from('album_pages').select('*').eq('id', pageId).single()
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    element = React.createElement(SinglePagePDF, {
      page: page as AlbumPage,
      album: album as Album,
      subject: subject as Subject,
    })
    const label = (page as AlbumPage).title || `p${(page as AlbumPage).page_number}`
    filename = encodeURIComponent(`${(album as Album).title}_${label}.pdf`)
  } else {
    // ── アルバム全ページ PDF ──
    const { data: pages } = await supabase
      .from('album_pages').select('*').eq('album_id', albumId).order('page_number')

    element = React.createElement(AlbumPDF, {
      album: album as Album,
      pages: (pages as AlbumPage[]) || [],
      subject: subject as Subject,
    })
    filename = encodeURIComponent(`${(album as Album).title}.pdf`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await pdf(element as any).toBuffer()
  const buffer = await streamToBuffer(stream as AsyncIterable<Buffer>)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
