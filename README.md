# histori. — 認知症ケアのためのデジタル回想法プラットフォーム

大切な人の記憶を、物語に。

回想法（Reminiscence Therapy）は、過去の思い出を語り合うことで認知症の方の心理的な安定・コミュニケーション活性化・生活の質向上を目的とした非薬物的ケアアプローチです。histori. はその実践をデジタルでサポートするオープンソースプラットフォームです。

---

## 主な機能

- **聴き取りセッション**：ライフステージ別の質問バンク（100問以上）による構造化回想法
- **思い出アルバム**：写真・テキストをページ形式で整理・PDF出力
- **音楽療法**：著作権フリーの唱歌・童謡10曲＋個人アップロード楽曲の再生
- **動画回想**：30分タイマー付きセッション・4種類の反応記録
- **共同セッションモード**：ケアラーと本人が一緒に見られる大画面表示

---

## セットアップ

### 1. Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) にアクセスして新規プロジェクトを作成
2. **Settings → API** から `Project URL` と `anon key` をコピー
3. **Settings → API** から `service_role key` をコピー
4. **SQL Editor** で `supabase/migrations/001_initial.sql` の内容を実行
5. **Storage → New bucket** で `media`（Private）を作成

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Supabase の情報を入力してください。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. ローカル起動

```bash
pnpm install
pnpm dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## Vercel デプロイ

```bash
npx vercel
```

Vercel の環境変数に `.env.local` と同じキー・値を設定してください。

---

## 音楽ファイルの追加方法

`public/music/` フォルダにMP3ファイルを配置してください。

```
public/music/furusato.mp3
public/music/haru_no_ogawa.mp3
public/music/aka_tonbo.mp3
public/music/umi.mp3
public/music/yuyake_koyake.mp3
public/music/shojoji.mp3
public/music/donguri.mp3
public/music/momiji.mp3
public/music/hana.mp3
public/music/sakura.mp3
```

著作権が消滅した楽曲（作曲者の没後70年以上経過）をご利用ください。
[Wikimedia Commons](https://commons.wikimedia.org/) などのパブリックドメイン音源を利用できます。

---

## 技術スタック

| 領域 | 技術 |
|---|---|
| フロントエンド | Next.js 14（App Router）+ TypeScript + Tailwind CSS |
| バックエンド | Supabase（PostgreSQL + Storage + Auth） |
| 音楽再生 | HTML5 Audio API |
| 動画再生 | HTML5 video タグ |
| ホスティング | Vercel |
| パッケージ管理 | pnpm |

---

## ライセンス

MIT License

本ソフトウェアは認知症ケアの治療を目的とするものではありません。生活の質の向上を目的とした非薬物的アプローチのツールです。医療的な判断は必ず専門家にご相談ください。
