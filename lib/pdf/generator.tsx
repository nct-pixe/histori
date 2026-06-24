import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import type { Album, AlbumPage, Subject } from '@/lib/supabase/types'

// フォント登録（Noto Sans JP - CDN）
Font.register({
  family: 'NotoSansJP',
  src: 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj757JMg.ttf',
})

const STAGE_LABELS: Record<string, string> = {
  childhood: '幼少期', school: '学校時代', youth: '青年期',
  family: '家庭期', prime: '働き盛り', senior: '晩年期', present: '現在',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 14,
    color: '#1F2937',
  },
  coverPage: {
    fontFamily: 'NotoSansJP',
    backgroundColor: '#1B3A6B',
    padding: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'NotoSansJP',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 20,
    color: '#99D6CC',
    marginBottom: 8,
    textAlign: 'center',
  },
  coverMeta: {
    fontSize: 14,
    color: '#7FB8B3',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP',
    color: '#1B3A6B',
    flex: 1,
  },
  headerStage: {
    fontSize: 12,
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
    padding: '4 8',
    borderRadius: 4,
  },
  body: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  textArea: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP',
    color: '#1B3A6B',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 1.8,
    color: '#1F2937',
  },
  photo: {
    width: 220,
    height: 220,
    objectFit: 'cover',
    borderRadius: 4,
  },
  photoLarge: {
    width: '100%',
    height: 280,
    objectFit: 'cover',
    borderRadius: 4,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoGridItem: {
    width: 220,
    height: 220,
    objectFit: 'cover',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 'auto',
    fontSize: 11,
    color: '#9CA3AF',
  },
  colophonPage: {
    fontFamily: 'NotoSansJP',
    backgroundColor: '#F8FAFC',
    padding: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
})

interface Props {
  album: Album
  pages: AlbumPage[]
  subject: Subject
}

interface SinglePageProps {
  page: AlbumPage
  album: Album
  subject: Subject
}

/** 1ページ単体のA4 PDF */
export function SinglePagePDF({ page, album, subject }: SinglePageProps) {
  return (
    <Document title={`${album.title} - ${page.title || `p.${page.page_number}`}`} author="histori.">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {page.title && <Text style={s.headerTitle}>{page.title}</Text>}
          {page.life_stage && (
            <Text style={s.headerStage}>{STAGE_LABELS[page.life_stage] || page.life_stage}</Text>
          )}
        </View>

        {page.template === 'text_only' ? (
          <View style={{ flex: 1 }}>
            {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
          </View>
        ) : page.template === 'large_photo' ? (
          <View style={{ flex: 1 }}>
            {page.photo_urls?.[0] && <Image src={page.photo_urls[0]} style={s.photoLarge} />}
            {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
          </View>
        ) : page.template === 'grid' ? (
          <View style={{ flex: 1 }}>
            <View style={s.photoGrid}>
              {(page.photo_urls || []).slice(0, 4).map((url, i) => (
                <Image key={i} src={url} style={s.photoGridItem} />
              ))}
            </View>
            {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
          </View>
        ) : (
          <View style={s.body}>
            <View style={s.textArea}>
              {page.title && <Text style={s.pageTitle}>{page.title}</Text>}
              {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
            </View>
            {page.photo_urls?.[0] && <Image src={page.photo_urls[0]} style={s.photo} />}
          </View>
        )}

        <View style={s.footer}>
          <Text>{subject.name} さんのアルバム</Text>
          <Text>— {page.page_number} —</Text>
        </View>
      </Page>
    </Document>
  )
}

export function AlbumPDF({ album, pages, subject }: Props) {
  return (
    <Document title={album.title} author="histori.">
      {/* 表紙 */}
      <Page size="A4" style={{ fontFamily: 'NotoSansJP' }}>
        <View style={s.coverPage}>
          <Text style={s.coverTitle}>{album.title}</Text>
          <Text style={s.coverSubtitle}>{subject.name} さんの記憶</Text>
          {subject.birth_year && (
            <Text style={s.coverMeta}>{subject.birth_year}年生まれ</Text>
          )}
          {subject.birth_region && (
            <Text style={s.coverMeta}>{subject.birth_region}</Text>
          )}
          <Text style={{ ...s.coverMeta, marginTop: 32 }}>
            作成日：{new Date(album.created_at).toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </Page>

      {/* 各ページ */}
      {pages.map((page) => (
        <Page key={page.id} size="A4" style={s.page}>
          {/* ヘッダー */}
          <View style={s.header}>
            {page.title && <Text style={s.headerTitle}>{page.title}</Text>}
            {page.life_stage && (
              <Text style={s.headerStage}>{STAGE_LABELS[page.life_stage] || page.life_stage}</Text>
            )}
          </View>

          {/* コンテンツ */}
          {page.template === 'text_only' ? (
            <View style={{ flex: 1 }}>
              {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
            </View>
          ) : page.template === 'large_photo' ? (
            <View style={{ flex: 1 }}>
              {page.photo_urls?.[0] && (
                <Image src={page.photo_urls[0]} style={s.photoLarge} />
              )}
              {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
            </View>
          ) : page.template === 'grid' ? (
            <View style={{ flex: 1 }}>
              <View style={s.photoGrid}>
                {(page.photo_urls || []).slice(0, 4).map((url, i) => (
                  <Image key={i} src={url} style={s.photoGridItem} />
                ))}
              </View>
              {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
            </View>
          ) : (
            // standard
            <View style={s.body}>
              <View style={s.textArea}>
                {page.title && <Text style={s.pageTitle}>{page.title}</Text>}
                {page.body_text && <Text style={s.bodyText}>{page.body_text}</Text>}
              </View>
              {page.photo_urls?.[0] && (
                <Image src={page.photo_urls[0]} style={s.photo} />
              )}
            </View>
          )}

          {/* フッター */}
          <View style={s.footer}>
            <Text>{subject.name} さんのアルバム</Text>
            <Text>— {page.page_number} —</Text>
          </View>
        </Page>
      ))}

      {/* 奥付 */}
      <Page size="A4" style={{ fontFamily: 'NotoSansJP' }}>
        <View style={s.colophonPage}>
          <Text style={{ fontSize: 18, color: '#1F2937', marginBottom: 16 }}>{album.title}</Text>
          <Text>制作：histori. デジタル回想法プラットフォーム</Text>
          <Text style={{ marginTop: 8 }}>
            完成日：{new Date().toLocaleDateString('ja-JP')}
          </Text>
          {subject.consent_agreed_at && (
            <Text style={{ marginTop: 8 }}>
              同意取得日：{new Date(subject.consent_agreed_at).toLocaleDateString('ja-JP')}
            </Text>
          )}
          <Text style={{ marginTop: 32, fontSize: 11 }}>
            本アルバムは回想法ケアの記録として作成されました。
          </Text>
        </View>
      </Page>
    </Document>
  )
}
