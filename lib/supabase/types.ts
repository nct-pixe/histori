export type UserMode = 'family' | 'facility'
export type CareLevel = 1 | 2 | 3
export type SessionGoal = 'care' | 'album' | 'music' | 'video' | 'all'
export type LifeStage = 'childhood' | 'school' | 'youth' | 'family' | 'prime' | 'senior' | 'present'
export type AlbumTemplate = 'standard' | 'large_photo' | 'text_only' | 'grid'
export type ReactionType = 'smile' | 'talk' | 'tear' | 'none'

export interface Profile {
  id: string
  mode: UserMode
  created_at: string
}

export interface Subject {
  id: string
  user_id: string
  name: string
  birth_year?: number
  birth_region?: string
  career?: string
  hobbies?: string
  family_structure?: string
  music_preference?: string
  care_level?: CareLevel
  session_goal?: SessionGoal
  consent_agreed_at?: string
  created_at: string
}

export interface Session {
  id: string
  subject_id: string
  life_stage: LifeStage
  theme?: string
  started_at: string
  completed_at?: string
  week_number: number
}

export interface Answer {
  id: string
  session_id: string
  question_id: string
  question_text: string
  answer_text?: string
  photo_urls?: string[]
  created_at: string
}

export interface Album {
  id: string
  subject_id: string
  title: string
  chapter_structure?: object
  is_published: boolean
  share_token?: string
  created_at: string
  updated_at: string
}

export interface AlbumPage {
  id: string
  album_id: string
  page_number: number
  template: AlbumTemplate
  title?: string
  body_text?: string
  photo_urls?: string[]
  music_url?: string
  video_url?: string
  life_stage?: string
  created_at: string
}

export interface MusicFile {
  id: string
  subject_id: string
  title: string
  artist?: string
  file_url: string
  era_decade?: number
  mood?: string
  reaction_score: number
  created_at: string
}

export interface VideoFile {
  id: string
  subject_id: string
  title: string
  description?: string
  file_url: string
  thumbnail_url?: string
  era_decade?: number
  life_stage?: string
  reaction_log: Array<{ timestamp: number; reaction: ReactionType }>
  created_at: string
}
