'use strict';
const fs = require('fs');
const path = require('path');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents,
} = require('docx');

const NAVY   = '1B3A6B';
const TEAL   = '0D9488';
const AMBER  = 'D97706';
const WHITE  = 'FFFFFF';
const LIGHT  = 'EEF2F8';
const GRAY   = '6B7280';

const cellBorder = (color) => ({
  top:    { style: BorderStyle.SINGLE, size: 1, color },
  bottom: { style: BorderStyle.SINGLE, size: 1, color },
  left:   { style: BorderStyle.SINGLE, size: 1, color },
  right:  { style: BorderStyle.SINGLE, size: 1, color },
});

function hdrCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBorder(NAVY),
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: WHITE, font: 'Meiryo', size: 20 })],
    })],
  });
}

function dataCell(text, w, shade, bold) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBorder('CCCCCC'),
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: 'Meiryo', size: 20, bold: !!bold })],
    })],
  });
}

function p(text, opts) {
  opts = opts || {};
  return new Paragraph({
    spacing: { before: opts.before || 80, after: opts.after || 80 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text,
      font: 'Meiryo',
      size: opts.size || 22,
      bold: opts.bold || false,
      color: opts.color || '1F2937',
    })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text, font: 'Meiryo', size: 36, bold: true, color: NAVY })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL } },
    children: [new TextRun({ text, font: 'Meiryo', size: 28, bold: true, color: TEAL })],
  });
}

function blank() {
  return new Paragraph({ children: [new TextRun(' ')], spacing: { before: 40, after: 40 } });
}

function infoTable(rows, w1, w2) {
  w1 = w1 || 3000;
  w2 = w2 || 6026;
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [w1, w2],
    rows: rows.map(function(r) {
      return new TableRow({
        children: [dataCell(r[0], w1, LIGHT, true), dataCell(r[1], w2)],
      });
    }),
  });
}

function steps(items) {
  return items.map(function(item, i) {
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: (i + 1) + '.  ', font: 'Meiryo', size: 22, bold: true, color: TEAL }),
        new TextRun({ text: item, font: 'Meiryo', size: 22, color: '1F2937' }),
      ],
    });
  });
}

function bullets(items) {
  return items.map(function(item) {
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '・', font: 'Meiryo', size: 22, color: TEAL, bold: true }),
        new TextRun({ text: item, font: 'Meiryo', size: 22, color: '1F2937' }),
      ],
    });
  });
}

function note(text) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9026, type: WidthType.DXA },
        borders: cellBorder(AMBER),
        shading: { fill: 'FFF8E6', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'POINT  ', font: 'Meiryo', size: 20, bold: true, color: AMBER }),
            new TextRun({ text, font: 'Meiryo', size: 20, color: '92400E' }),
          ],
        })],
      })],
    })],
  });
}

// ================================================================
var children = [];

// 表紙
children.push(blank(), blank(), blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 120 },
  children: [new TextRun({ text: 'histori.', font: 'Meiryo', size: 96, bold: true, color: NAVY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 600 },
  children: [new TextRun({ text: 'デジタル回想法プラットフォーム', font: 'Meiryo', size: 36, color: TEAL })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 120 },
  children: [new TextRun({ text: '取扱説明書', font: 'Meiryo', size: 64, bold: true, color: NAVY })],
}));
children.push(blank(), blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: 'バージョン 1.0.0　2026年6月23日', font: 'Meiryo', size: 24, color: GRAY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: 'NEURO CARE TECH 株式会社', font: 'Meiryo', size: 24, bold: true, color: NAVY })],
}));
children.push(new Paragraph({ children: [new PageBreak()] }));

// 目次
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 0, after: 200 },
  children: [new TextRun({ text: '目　次', font: 'Meiryo', size: 36, bold: true, color: NAVY })],
}));
children.push(new TableOfContents('目次', { hyperlink: true, headingStyleRange: '1-3' }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// 第1章
children.push(h1('第1章　histori. とは'));
children.push(p('histori.（ヒストリ）は、NEURO CARE TECH 株式会社が開発した認知甠7ァア向け「デジタル回想法プラットフォーム」です。110問以上の質問バンクを通じて利用者の大切な記憶を引き出し、デジタルアルバムとして保存・共有できます。'));
children.push(blank());
children.push(h2('1-1　主な機能'));
children.push(infoTable([
  ['回想セッション', '7つのライフステージ別に吹選した質問で記憶を引き出します'],
  ['デジタルアルバム', 'テキスト・写真を組み合わせた4レイアウトのアルバムを作成します'],
  ['PDF出力', 'A4縦形式のアルバムをPDFとして出力・印刷できます'],
  ['音楽療法', '唄歌・民謡など著作権フリー楽曲で回想を促進します'],
  ['動画回想', '映像視聴中の反応（笑顔・発話・涙など）をタイムスタンプ付きで記録します'],
  ['デモモード', 'Supabase不要でサンプルデータを体験できます（田中花子さん）'],
]));
children.push(blank());
children.push(h2('1-2　対象ユーザー'));
children.push(...bullets([
  '認知甠7ご本人・家族介護者',
  '介護施設のケアスタッフ・作業療法士',
  'デイサービス・通所リハビリの支援者',
  '回想法・非薬物的介入に関心のある医療従事者',
]));
children.push(blank());
children.push(h2('1-3　技術スタック概要'));
children.push(infoTable([
  ['フレームワーク', 'Next.js 14（App Router）'],
  ['言語', 'TypeScript'],
  ['スタイル', 'Tailwind CSS'],
  ['データベース', 'Supabase（PostgreSQL + Storage + Auth）'],
  ['PDF生成', '@react-pdf/renderer'],
  ['デプロイ', 'Vercel'],
  ['パッケージ管理', 'pnpm'],
]));

// 第2章
children.push(h1('第2章　システム要件と事前準備'));
children.push(h2('2-1　動作環境'));
children.push(infoTable([
  ['Node.js', 'v18以上（v20推奨）'],
  ['pnpm', 'v8以上'],
  ['ブラウザ', 'Chrome 110+ / Firefox 110+ / Safari 16+ / Edge 110+'],
  ['OS', 'Windows 10/11・macOS 12以上・Ubuntu 20.04以上'],
]));
children.push(blank());
children.push(h2('2-2　Supabase プロジェクトの準備'));
children.push(p('histori. を本番環境で利用するには Supabase アカウントが必要です。デモモードは不要です。'));
children.push(blank());
children.push(...steps([
  'https://supabase.com にアクセスし、無料アカウントを作成します',
  '「New project」をクリックし、プロジェクト名・パスワード・リージョン（ap-northeast-1 推奨）を入力します',
  'プロジェクト作成後、Settings → API から「Project URL」と「anon key」をコピーします',
  'SQL Editor を開き、histori/supabase/migrations/001_initial.sql の内容を貼り付けて実行します',
  '「Storage」メニューで「New bucket」を作成し、バケット名を album-photos・music-files・video-files とします',
  '各バケットのアクセス設定で「Public bucket」を ON にします',
]));
children.push(blank());
children.push(note('SQL実行後は「Table Editor」でprofiles・subjects・sessions・answers・albums・album_pages・music_files・video_filesの8テーブルが作成されていることを確認してください。'));

// 第3章
children.push(h1('第3章　インストールと起動'));
children.push(h2('3-1　リポジトリのクローン'));
children.push(p('git clone <リポジトリ URL>'));
children.push(p('cd histori'));
children.push(blank());
children.push(h2('3-2　環境変数の設定'));
children.push(p('histori フォルダ直下に .env.local ファイルを作成し、以下の内容を記載します。'));
children.push(infoTable([
  ['NEXT_PUBLIC_SUPABASE_URL', 'SupabaseのProject URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabaseのanon key'],
], 3600, 5426));
children.push(blank());
children.push(h2('3-3　依存パッケージのインストール'));
children.push(p('pnpm install'));
children.push(blank());
children.push(h2('3-4　開発サーバーの起動'));
children.push(p('pnpm dev'));
children.push(p('起動後、ブラウザで http://localhost:3000 を開きます。'));

// 第4章
children.push(h1('第4章　アカウント作成とログイン'));
children.push(h2('4-1　新規アカウント作成'));
children.push(...steps([
  'トップページ（/login）の「新規登録はこちら」をクリックします',
  'メールアドレス・パスワード（8文字以上）を入力します',
  '利用モードを「家族介護者」または「施設スタッフ」から選びます',
  '「アカウントを作成」ボタンをクリックします',
  'Supabase から確認メールが届きます。メール内のリンクをクリックして認証を完了します',
  '認証完了後、ダッシュボード（/dashboard）に自動遷移します',
]));
children.push(blank());
children.push(h2('4-2　ログイン'));
children.push(p('/login ページでメールアドレスとパスワードを入力し「ログイン」をクリックします。'));
children.push(blank());
children.push(h2('4-3　ログアウト'));
children.push(p('画面上部ナビゲーションの「ログアウト」をクリックします。セッションが終了し /login に遷移します。'));

// 第5章
children.push(h1('第5章　対象者（Subject）の登録'));
children.push(p('「対象者」とは、回想セッションを行う方（認知甠7ご本人など）を指します。'));
children.push(blank());
children.push(h2('5-1　新規登録フロー（6ステップ）'));
children.push(infoTable([
  ['Step 1  氏名入力', '対象者のフルネームを入力します'],
  ['Step 2  基本プロフィール', '生年・出身地・職歴・趣味・家族構成・音楽の好みを入力します'],
  ['Step 3  ケアレベル設定', '1〜3のレベルを選択します（1:軽度 / 2:中等度 / 3:重度）。質問の難易度に影響します'],
  ['Step 4  セッション目標', '「全般」「記憶の整理」「家族との絆」などから選択します'],
  ['Step 5  同意確認', 'データ利用・プライバシーに関する説明を確認し、チェックボックスにチェックを入れます'],
  ['Step 6  登録完了', '「ダッシュボードへ」ボタンでホームに戻ります'],
]));
children.push(blank());
children.push(note('ケアレベル3（重度）では、質問は「やさしい（初級）」レベルのみ選出されます。ケアレベル1（軽度）は全難易度の質問が対象になります。'));

// 第6章
children.push(h1('第6章　回想セッションの実施'));
children.push(h2('6-1　ライフステージの選択'));
children.push(p('ダッシュボードで対象者カードの「回想セッション」ボタンをクリックすると、7つのライフステージ選択画面が表示されます。'));
children.push(blank());
children.push(infoTable([
  ['幼少期',    '幼稚図・保育図時代（0〜6歳頃）'],
  ['学校時代',  '小学校〜高校時代（7〜18歳頃）'],
  ['青年期',    '就職・上京・一人暮らし開始（18〜30歳頃）'],
  ['家庭期',    '結婚・育児・家族との暮らし（30〜45歳頃）'],
  ['働き盛り',  'キャリアの最盛期（40〜60歳頃）'],
  ['晩年期',    '定年後・孫との時間（60〜75歳頃）'],
  ['現在',      '今の暮らしや気持ち・将来への思い'],
]));
children.push(blank());
children.push(h2('6-2　セッション画面の使い方'));
children.push(...steps([
  '質問が大きく表示されます。回答欄にテキストを入力します',
  '「掘り下げる」ボタンで同テーマの追加質問を表示できます',
  '「共有モード」 ON にすると文字サイズが大型化し、対象者本人に画面を見せながら進められます',
  '回答を入力すると自動保存されます（保存マーク表示）',
  '「次の質問へ」で次の質問に進みます',
  '全問終了後「セッション完了」ボタンを押してセッションを終了します',
]));
children.push(blank());
children.push(h2('6-3　感情ケアモーダル'));
children.push(p('「つらい思い出」「悲しい気持ち」などのキーワードが入力に含まれると、感情ケアモーダルが自動表示されます。ケアワーカーへの声かけ例文が表示され、セッションを一時停止して対応できます。'));
children.push(blank());
children.push(h2('6-4　質問バンク'));
children.push(p('110問以上の質問は以下の6カテゴリに分類されています。'));
children.push(infoTable([
  ['開放型（op）',    '自由に語れる質問'],
  ['掘り下げ（dd）',    '感情・価値観に踏み込む質問'],
  ['家族・関係（fam）','家族・人間関係に関する質問'],
  ['仕事・役割（work）','職業・役割・護りに関する質問'],
  ['五感（sense）',   '味・音・匂い・景色など感覚的記憶の質問'],
  ['統合（int）',     '人生の意味・振り返り・メッセージに関する質問'],
]));

// 第7章
children.push(h1('第7章　アルバムの作成と編集'));
children.push(h2('7-1　アルバムの新規作成'));
children.push(...steps([
  'ダッシュボードで対象者カードの「アルバム」ボタンをクリックします',
  '「新しいアルバムを作成」ボタンをクリックします',
  'タイトルを入力して「作成」をクリックします',
]));
children.push(blank());
children.push(h2('7-2　ページの追加と編集'));
children.push(p('アルバム編集画面は「ページ一覧（左）」と「編集エリア（右）」の2ペイン構造です。'));
children.push(blank());
children.push(infoTable([
  ['ページ追加', '「＋ページを追加」ボタンをクリックします'],
  ['レイアウト選択', '標準 / 写真大 / テキスト / グリッド の4種類から選べます'],
  ['ライフステージ', '該当するライフステージをプルダウンで選択します'],
  ['タイトル', 'ページのタイトルを入力します'],
  ['本文', '最大200文字の思い出テキストを入力します'],
  ['回答から挿入', '過去のセッション回答を本文に引用できます'],
  ['写真アップロード', '写真を選択してSupabase Storageにアップロードします'],
  ['保存', '「保存する」ボタンで変更を確定します'],
]));
children.push(blank());
children.push(h2('7-3　4種類のレイアウト'));
children.push(infoTable([
  ['標準（standard）',      'テキスト上部・写真下部の基本レイアウト'],
  ['写真大（large_photo）', '写真をページ上部に大きく配置'],
  ['テキストのみ（text_only）', 'メッセージや詩など文字中心のページ'],
  ['グリッド（grid）',      '複数写真を格子状に配置するレイアウト'],
]));
children.push(blank());
children.push(h2('7-4　アルバムのプレビューと公開'));
children.push(...bullets([
  '「プレビュー」ボタンで完成イメージを確認できます',
  '「公開する」スイッチをONにすると共有URLが発行されます',
  '「PDF出力」ボタンでA4縦形式のPDFをダウンロードできます（Supabase接続が必要）',
]));

// 第8章
children.push(h1('第8章　音楽療法セッション'));
children.push(h2('8-1　基本操作'));
children.push(p('ナビゲーションの「音楽」をクリックして音楽療法セッションページを開きます。'));
children.push(blank());
children.push(...bullets([
  '▶ ボタンで再生、⏸ ボタンで一時停止',
  '音量スライダーで音量を0～100%に調整',
  '「反応あり」ボタンで反応スコアを+1できます',
]));
children.push(blank());
children.push(h2('8-2　デフォルト収録楽曲'));
children.push(p('著作権フリーの唄歌・唤歌を十曲収録しています。public/music/ フォルダにMPZファイルを配置すると再生されます。'));
children.push(blank());
children.push(infoTable([
  ['故郷', '文部省唄歌（1914年）'],
  ['春の小川', '文部省唄歌（1912年）'],
  ['赤とんぼ', '三木露風（1921年）'],
  ['海', '文部省唄歌（1913年）'],
  ['ゆうやけこやけ', '中村雨紅（1923年）'],
  ['証城寺の狸囃子', '野口雨情（1924年）'],
  ['どんぐりころころ', '青木存義（1921年）'],
  ['紅葉', '文部省唄歌（1911年）'],
  ['花', '武島羽衣（1900年）'],
  ['さくらさくら', '伝統曲（1888年）'],
]));
children.push(blank());
children.push(h2('8-3　楽曲のアップロード'));
children.push(...steps([
  '「＋ 楽曲をアップロード」ボタンをクリックします',
  'タイトル・アーティスト名・年代・ムード（happy/nostalgic/calm/energetic）を入力します',
  'MP3またはAACファイルを選択してアップロードします',
  '「保存」ボタンで登録完了です',
]));

// 第9章
children.push(h1('第9章　動画回想セッション'));
children.push(h2('9-1　セッションの開始'));
children.push(...steps([
  'ナビゲーションの「動画」をクリックして動画ライブラリページを開きます',
  '視聴する動画の「▶ セッション開始」をクリックします',
  '30分タイマーが自動でカウントダウンを開始します',
  '動画を再生しながら、対象者の反応を観察します',
]));
children.push(blank());
children.push(h2('9-2　反応の記録'));
children.push(p('セッション中は4種類の反応ボタンでタイムスタンプ付きの記録ができます。'));
children.push(infoTable([
  ['[笑顔]', '表情が和んだ・笑顔が見られたとき'],
  ['[発話]', '言葉を発した・話し始めたとき'],
  ['[涙]', '涙ぐんだ・泣いたとき'],
  ['○ 無反応', '無反応・表情変化なしの記録'],
]));
children.push(blank());
children.push(h2('9-3　タイマーアラート'));
children.push(p('残り5分（300秒）を切ると、タイマー表示が赤く点滅してアラートを通知します。'));
children.push(blank());
children.push(h2('9-4　動画のアップロード'));
children.push(...steps([
  '「＋ 動画をアップロード」ボタンをクリックします',
  'タイトル・説明・年代・ライフステージを入力します',
  'MP4またはWebMファイルを選択してアップロードします（最大500MB）',
  '「保存」ボタンで登録完了です',
]));

// 第10章
children.push(h1('第10章　デモモード'));
children.push(p('デモモードは Supabase アカウントなしで histori. の全機能を体験できるサンドボックス環境です。データはブラウザ内メモリに保持され、ページ更新でリセットされます。'));
children.push(blank());
children.push(h2('10-1　アクセス方法'));
children.push(p('ブラウザで /demo を開くだけです（ログイン不要）。'));
children.push(blank());
children.push(h2('10-2　デモ対象者：田中 花子さん'));
children.push(infoTable([
  ['氏名', '田中 花子（たなか はなこ）'],
  ['生年', '1935年'],
  ['出身地', '青森県弘前市'],
  ['職歴', '小学校教師（35年勤務）'],
  ['趣味', '庭仕事・演歌鑑賯・俳句'],
  ['家族構成', '長男・次女・孫5人'],
  ['音楽の好み', '演歌・美空ひばり・民謡'],
  ['ケアレベル', '2（中等度）'],
]));
children.push(blank());
children.push(h2('10-3　デモで体験できる機能'));
children.push(...bullets([
  '回想セッション（全ライフステージ）：回答はReact stateに保存',
  'アルバム編集・プレビュー：ページ追加・テンプレート変更・回答引用が可能',
  '音楽療法：反応スコアの加算が可能（音楽ファイルはpublic/music/に配置が必要）',
  '動画回想：30分タイマー・反応記録のUIが動作',
]));
children.push(blank());
children.push(note('デモモードではPDF出力・写真アップロード・データの永続化は利用できません。これらはSupabase接続時のみ有効です。'));

// 第11章
children.push(h1('第11章　Vercel へのデプロイ'));
children.push(h2('11-1　デプロイ手順'));
children.push(...steps([
  'GitHub（または GitLab / Bitbucket）にリポジトリを作成し、histori フォルダをプッシュします',
  'https://vercel.com にアクセスし、「New Project」をクリックします',
  'リポジトリを選択し、「Root Directory」に histori を指定します',
  '「Environment Variables」に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定します',
  '「Deploy」をクリックすると自動ビルドとデプロイが始まります',
  '完了後、発行されたURLで histori. にアクセスできます',
]));
children.push(blank());
children.push(h2('11-2　カスタムドメインの設定'));
children.push(p('Vercelダッシュボードの「Settings → Domains」から独自ドメインを設定できます。'));

// 第12章（FAQ）
children.push(h1('第12章　よくある質問（FAQ）'));

var faqs = [
  ['Q. Supabase を使わずに本番運用できますか？', 'デモモード（/demo）はSupabase不要ですが、ユーザー認証・データ永続化・ファイルアップロードにはSupabase接続が必要です。'],
  ['Q. 既存の回想セッションを削除するには？', '現バージョンでは管理画面からの一括削除はサポートしていません。Supabase の Table Editor からデータを直接削除してください。'],
  ['Q. PDF が出力されません', 'Supabaseの接続設定を確認してください。Vercelの無料プランの実行時間制限（10秒）を超えている場合もあります。'],
  ['Q. 音楽が再生されません', 'デフォルト楽曲はMP3ファイルを public/music/ フォルダに配置する必要があります。ファイル名は furusato.mp3 のようにIDと一致させてください。'],
  ['Q. 質問を追加・カスタマイズできますか？', 'histori/lib/questions/bank.ts を編集することで質問の追加・変更が可能です。id・category・lifeStage・difficulty・text・followups の6フィールドを指定してください。'],
  ['Q. スマートフォンで使えますか？', 'はい。レスポンシブデザインに対応しており、iOS Safari・Android Chrome で動作確認済みです。'],
  ['Q. データのバックアップはどうすればよいですか？', 'Supabase ダッシュボードの「Database → Backups」から定期バックアップを設定できます。'],
  ['Q. ログインメールが届きません', 'Supabaseのメール送信制限（1時間に3通）に達している場合があります。ダッシュボードの「Authentication → Users」から直接ユーザーの確認ステータスを変更できます。'],
];

faqs.forEach(function(qa) {
  children.push(new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text: qa[0], font: 'Meiryo', size: 22, bold: true, color: NAVY })],
  }));
  children.push(new Paragraph({
    spacing: { before: 0, after: 120 },
    indent: { left: 360 },
    children: [new TextRun({ text: qa[1], font: 'Meiryo', size: 22, color: '1F2937' })],
  }));
});

// 付録A
children.push(h1('付録A　質問バンク サンプル一覧'));
children.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [1600, 1200, 1200, 5026],
  rows: [
    new TableRow({ children: [hdrCell('カテゴリ', 1600), hdrCell('ステージ', 1200), hdrCell('難易度', 1200), hdrCell('質問文', 5026)] }),
    ...[
      ['開放型', '幼少期', 'やさしい', '子どものころ、どんな遅びが好きでしたか？'],
      ['開放型', '幼少期', 'やさしい', '子どものころ、家の辺りに川や山はありましたか？'],
      ['開放型', '学校時代', 'やさしい', '学校で一番好きだった先生を教えてください'],
      ['深掘り', '青年期', '普通', '初めてお給料をもらったとき、どんな気持ちでしたか？'],
      ['深掘り', '家庭期', '普通', 'お子さんが生まれたとき、どんな気持ちでしたか？'],
      ['家族関係', '家庭期', '普通', 'ご家族との大切な思い出を一つ教えてください'],
      ['仕事役割', '働き盛り', '難しい', 'お仕事で一番讛りに思う出来事は何ですか？'],
      ['五感', '幼少期', 'やさしい', '子どものころ、好きだった食べ物は何ですか？'],
      ['五感', '学校時代', 'やさしい', '本当よく聴いていた歌や音楽はありますか？'],
      ['統合', '現在', '普通', 'あなたの人生で一番讛りに思うことは何ですか？'],
    ].map(function(r) {
      return new TableRow({ children: [dataCell(r[0],1600), dataCell(r[1],1200), dataCell(r[2],1200), dataCell(r[3],5026)] });
    }),
  ],
}));

// 付録B
children.push(h1('付録B　技術仕様'));
children.push(infoTable([
  ['アプリ名称', 'histori.（ヒストリ）'],
  ['バージョン', '1.0.0'],
  ['ライセンス', 'NEURO CARE TECH 株式会社 独自ライセンス'],
  ['フレームワーク', 'Next.js 14.2.x（App Router）'],
  ['言語', 'TypeScript 5.x'],
  ['UIライブラリ', 'Tailwind CSS 3.x'],
  ['データベース', 'Supabase（PostgreSQL 15）'],
  ['認証', 'Supabase Auth（メール/パスワード）'],
  ['ストレージ', 'Supabase Storage（S3互換）'],
  ['PDF生成', '@react-pdf/renderer 3.x'],
  ['音声再生', 'Web Audio API（HTML5 audio）'],
  ['動画再生', 'HTML5 video'],
  ['デプロイ', 'Vercel（pnpm build）'],
  ['推奨Node.js', 'v20 LTS'],
  ['主要DBテーブル', 'profiles / subjects / sessions / answers / albums / album_pages / music_files / video_files'],
  ['ストレージバケット', 'album-photos / music-files / video-files'],
  ['カラーパレット', 'Primary: #1B3A6B / Accent: #0D9488 / Warm: #D97706'],
], 3200, 5826));

// 奥付
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(blank(), blank(), blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 160 },
  children: [new TextRun({ text: 'histori.　取扱説明書', font: 'Meiryo', size: 36, bold: true, color: NAVY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: 'Version 1.0.0', font: 'Meiryo', size: 24, color: GRAY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: '発行日：2026年6月23日', font: 'Meiryo', size: 24, color: GRAY })],
}));
children.push(blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: '発行：NEURO CARE TECH 株式会社', font: 'Meiryo', size: 24, bold: true, color: NAVY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: 'info@nct-net.com', font: 'Meiryo', size: 22, color: TEAL })],
}));
children.push(blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '© 2026 NEURO CARE TECH Co., Ltd. All rights reserved.', font: 'Meiryo', size: 20, color: GRAY })],
}));

// ================================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Meiryo', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Meiryo', color: NAVY },
        paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Meiryo', color: TEAL },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Meiryo', color: NAVY },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: NAVY } },
          children: [new TextRun({ text: 'histori.　取扱説明書', font: 'Meiryo', size: 18, color: NAVY })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: '- ', font: 'Meiryo', size: 18, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Meiryo', size: 18, color: GRAY }),
            new TextRun({ text: ' -', font: 'Meiryo', size: 18, color: GRAY }),
          ],
        })],
      }),
    },
    children: children,
  }],
});

const outPath = path.join(__dirname, 'histori_取扱説明書.docx');
Packer.toBuffer(doc).then(function(buf) {
  fs.writeFileSync(outPath, buf);
  console.log('DONE:', outPath);
}).catch(function(err) {
  console.error('ERROR:', err.message);
  process.exit(1);
});
