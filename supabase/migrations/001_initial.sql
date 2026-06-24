-- ユーザーテーブル（Supabase Authと連携）
create table public.profiles (
  id uuid references auth.users primary key,
  mode text check (mode in ('family', 'facility')) not null,
  created_at timestamptz default now()
);

-- 主人公プロフィール
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  name text not null,
  birth_year int,
  birth_region text,
  career text,
  hobbies text,
  family_structure text,
  music_preference text,
  care_level int check (care_level between 1 and 3),
  session_goal text check (session_goal in ('care', 'album', 'music', 'video', 'all')),
  consent_agreed_at timestamptz,
  created_at timestamptz default now()
);

-- セッション
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects not null,
  life_stage text not null,
  theme text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  week_number int default 1
);

-- 回答
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions not null,
  question_id text not null,
  question_text text not null,
  answer_text text,
  photo_urls text[],
  created_at timestamptz default now()
);

-- アルバム
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects not null,
  title text not null,
  chapter_structure jsonb,
  is_published boolean default false,
  share_token text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- アルバムページ
create table public.album_pages (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.albums not null,
  page_number int not null,
  template text default 'standard',
  title text,
  body_text text,
  photo_urls text[],
  music_url text,
  video_url text,
  life_stage text,
  created_at timestamptz default now()
);

-- 音楽ライブラリ
create table public.music_files (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects not null,
  title text not null,
  artist text,
  file_url text not null,
  era_decade int,
  mood text,
  reaction_score int default 0,
  created_at timestamptz default now()
);

-- 動画ライブラリ
create table public.video_files (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects not null,
  title text not null,
  description text,
  file_url text not null,
  thumbnail_url text,
  era_decade int,
  life_stage text,
  reaction_log jsonb default '[]',
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.sessions enable row level security;
alter table public.answers enable row level security;
alter table public.albums enable row level security;
alter table public.album_pages enable row level security;
alter table public.music_files enable row level security;
alter table public.video_files enable row level security;

create policy "users_own_profile" on public.profiles for all using (id = auth.uid());
create policy "users_own_data" on public.subjects for all using (user_id = auth.uid());
create policy "sessions_own" on public.sessions for all using (
  subject_id in (select id from public.subjects where user_id = auth.uid())
);
create policy "answers_own" on public.answers for all using (
  session_id in (select s.id from public.sessions s
    join public.subjects sub on s.subject_id = sub.id
    where sub.user_id = auth.uid())
);
create policy "albums_own" on public.albums for all using (
  subject_id in (select id from public.subjects where user_id = auth.uid())
);
create policy "pages_own" on public.album_pages for all using (
  album_id in (select a.id from public.albums a
    join public.subjects sub on a.subject_id = sub.id
    where sub.user_id = auth.uid())
);
create policy "music_own" on public.music_files for all using (
  subject_id in (select id from public.subjects where user_id = auth.uid())
);
create policy "video_own" on public.video_files for all using (
  subject_id in (select id from public.subjects where user_id = auth.uid())
);
create policy "albums_public_share" on public.albums for select using (
  is_published = true and share_token is not null
);
