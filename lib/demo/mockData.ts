import type { Subject, Album, AlbumPage, MusicFile, VideoFile } from '@/lib/supabase/types'

export const DEMO_SUBJECT: Subject = {
  id: 'demo-subject-001',
  user_id: 'demo-user-001',
  name: '田中 花子',
  birth_year: 1935,
  birth_region: '青森県弘前市',
  career: '小学校教師（35年勤務）',
  hobbies: '庭仕事・演歌鑑賞・俳句',
  family_structure: '長男・次女・孫5人',
  music_preference: '演歌・美空ひばり・民謡',
  care_level: 2,
  session_goal: 'all',
  consent_agreed_at: '2026-01-15T00:00:00Z',
  created_at: '2026-01-15T00:00:00Z',
}

export const DEMO_ALBUM: Album = {
  id: 'demo-album-001',
  subject_id: 'demo-subject-001',
  title: '花子さんの思い出アルバム',
  chapter_structure: undefined,
  is_published: false,
  share_token: undefined,
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
}

export const DEMO_PAGES: AlbumPage[] = [
  {
    id: 'demo-page-001',
    album_id: 'demo-album-001',
    page_number: 1,
    template: 'large_photo',
    title: '弘前の春',
    body_text: '子どものころ、毎年お花見に行った弘前公園の桜。あの頃の賑やかさは今でも目に浮かびます。お父さんが大好きな場所でした。',
    photo_urls: [],
    life_stage: 'childhood',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'demo-page-002',
    album_id: 'demo-album-001',
    page_number: 2,
    template: 'standard',
    title: '先生になった日',
    body_text: '昭和33年、初めて担任を持ちました。38人の子どもたちが「先生！」と呼んでくれた声は、今でも忘れられません。',
    photo_urls: [],
    life_stage: 'youth',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'demo-page-003',
    album_id: 'demo-album-001',
    page_number: 3,
    template: 'text_only',
    title: '家族へのメッセージ',
    body_text: '長い人生、たくさんの方に助けていただきました。子どもたち、孫たち、本当にありがとう。これからも元気でいますよ。',
    photo_urls: [],
    life_stage: 'present',
    created_at: '2026-02-01T00:00:00Z',
  },
]

export const DEMO_MUSIC: MusicFile[] = [
  { id: 'demo-music-001', subject_id: 'demo-subject-001', title: 'リンゴの唄', artist: '並木路子', file_url: '', era_decade: 1940, mood: 'happy', reaction_score: 5, created_at: '2026-01-20T00:00:00Z' },
  { id: 'demo-music-002', subject_id: 'demo-subject-001', title: '津軽じょんから節', artist: '民謡', file_url: '', era_decade: 1960, mood: 'nostalgic', reaction_score: 8, created_at: '2026-01-20T00:00:00Z' },
  { id: 'demo-music-003', subject_id: 'demo-subject-001', title: '川の流れのように', artist: '美空ひばり', file_url: '', era_decade: 1980, mood: 'calm', reaction_score: 12, created_at: '2026-01-20T00:00:00Z' },
]

export const DEMO_VIDEOS: VideoFile[] = [
  { id: 'demo-video-001', subject_id: 'demo-subject-001', title: '昭和30年代の青森', description: '懐かしい街並みの映像', file_url: '', era_decade: 1950, life_stage: 'youth', reaction_log: [{ timestamp: 30, reaction: 'smile' }, { timestamp: 65, reaction: 'talk' }], created_at: '2026-01-25T00:00:00Z' },
  { id: 'demo-video-002', subject_id: 'demo-subject-001', title: '昔の学校の様子', description: '木造校舎・運動会の映像', file_url: '', era_decade: 1960, life_stage: 'prime', reaction_log: [{ timestamp: 15, reaction: 'smile' }], created_at: '2026-01-25T00:00:00Z' },
]

export const DEMO_ANSWERS = [
  { id: 'a1', session_id: 's1', question_id: 'op_childhood_001', question_text: '子どものころ、どんな遊びが好きでしたか？', answer_text: '近所の子たちと一緒に、川で魚を捕ったり、雪遊びをしたりしていました。冬は毎日雪合戦でしたね。', sessions: { life_stage: 'childhood' } },
  { id: 'a2', session_id: 's1', question_id: 'op_school_001', question_text: '学校で一番好きだった先生を教えてください。', answer_text: '5年生のときの山田先生。国語がとても上手で、よく詩を読んでくれました。私が先生になりたいと思ったのは山田先生の影響です。', sessions: { life_stage: 'school' } },
  { id: 'a3', session_id: 's2', question_id: 'dd_youth_001', question_text: '初めてお給料をもらったとき、どんな気持ちでしたか？', answer_text: '嬉しくて、すぐにお母さんに半分渡しました。残りで家族にお土産を買いに行きましたよ。', sessions: { life_stage: 'youth' } },
  { id: 'a4', session_id: 's2', question_id: 'int_present_001', question_text: 'あなたの人生で、一番誇りに思うことは何ですか？', answer_text: '35年間、一生懸命に子どもたちを育てたこと。今でも教え子が訪ねてきてくれるとき、本当にこの仕事をしてよかったと思います。', sessions: { life_stage: 'present' } },
]
