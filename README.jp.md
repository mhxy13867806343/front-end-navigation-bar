# HooksVue AI ナビゲーションツールボックス

[简体中文](./README.md) | [English](./README.en.md) | 日本語

Vue 3 + Vite で構築されたフロントエンド AI ツールナビゲーションサイトです。AI チャットアシスタント、AI ペイント、AI プログラミング、AI 開発プラットフォームなど、さまざまなツールの入り口を集約し、複数のミニゲームと便利なツールを内蔵しています。

## 📌 メンテナンス状況

> **📢 【プロジェクトアーカイブと更新停止のお知らせ】**
> すべての機能（WebComponents、Oat UI、100万件ログイン登録UI、100件カート、6.3万アニメーション、Motion for Vue、Schedule-X カレンダー、Three.js 3D マップ、Docker デュアルデプロイ、ソースコード表示センター）が**すべて完成しました**。
> 今後の機能更新は停止いたします。カスタマイズが必要な場合は、リポジトリの **Fork** や Issues / Discussions でのご自由な議論をお待ちしております！
> 本番環境のホームページでは毎回アーカイブ通知 Dialog を表示します。リアルタイム時刻、メール連絡リンク、ALAPI ジョーク一覧、jQuery の上方向スクロール、コピー操作を Naive UI Dialog 風にまとめています。

## 🌐 オンラインデモ

- 🐳 **Docker デュアルデプロイ**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/docker-showcase](https://mhxy13867806343.github.io/front-end-navigation-bar/#/docker-showcase)
- 💻 **ソースコード閲覧・0-ms コピーセンター**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/source-code](https://mhxy13867806343.github.io/front-end-navigation-bar/#/source-code)
- 📅 **Schedule-X ドラッグ＆ドロップカレンダー**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/schedule-x](https://mhxy13867806343.github.io/front-end-navigation-bar/#/schedule-x)
- ⚡ **Motion for Vue 50+ 展示**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/motion-showcase](https://mhxy13867806343.github.io/front-end-navigation-bar/#/motion-showcase)
- 🗺️ **Three.js 3D 地図デザイナー**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/three-showcase/china-map](https://mhxy13867806343.github.io/front-end-navigation-bar/#/three-showcase/china-map)
- 🌾 **Oat UI スタジオ演習センター**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/oat-studio](https://mhxy13867806343.github.io/front-end-navigation-bar/#/oat-studio)
- 📘 **掘金小冊コース**: [https://mhxy13867806343.github.io/front-end-navigation-bar/#/juejin-course](https://mhxy13867806343.github.io/front-end-navigation-bar/#/juejin-course)
- 🧭 **内部ニュースハブ**: [AI リソース](https://mhxy13867806343.github.io/front-end-navigation-bar/#/ai-xxx/ai-column) / [煎蛋](https://mhxy13867806343.github.io/front-end-navigation-bar/#/jandan) / [TopHub](https://mhxy13867806343.github.io/front-end-navigation-bar/#/tophub) / [IT之家](https://mhxy13867806343.github.io/front-end-navigation-bar/#/ithome) / [虎嗅](https://mhxy13867806343.github.io/front-end-navigation-bar/#/huxiu) / [GitHub オープンソース集約](https://mhxy13867806343.github.io/front-end-navigation-bar/#/github) / [記録キャッシュ表示](https://mhxy13867806343.github.io/front-end-navigation-bar/#/records-cache)
- 🏠 **ホーム**: [https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)

## ✨ 主な機能

- **🔐 100万件ログイン・会員登録 UI 展示** (`/auth-showcase`)：100万件（ログイン50万件＋会員登録50万件）のインタラクティブ UI、50のテーマカテゴリ、10件/ページのページネーションとIDジャンプ機能に対応。
- **🛒 100件ショッピングカート UI 展示** (`/cart-showcase`)：100件の重複なしショッピングカート UI。10種類の独自UIレイアウト（Glassmorphism、3D Neumorphism、Cyberpunk、B2B、Mobile H5、macOS 等）とリアルタイム価格計算・クーポン適用に対応。
- **✨ 63,353件 CSS/JS アニメーションエフェクト展示** (`/animation-showcase`)：63,353件の完全な重複なしアニメーションエフェクト。20のカテゴリ、リアルタイムプレビュー、再生/一時停止、倍速調整、コードコピーに対応。
- **🌾 Oat UI Studio (`/oat-studio`)**：[Oat.ink 公式 26 項コンポーネント](https://oat.ink/components/) (Dropdown, TagInput, Upload, Tabs WC) と Element Plus 64 項のコンポーネントディレクトリを集成。**Element Plus Dialog** と **Naive UI OS-Theme Dialog** 的設計仕様を融合。400 件のサンプルデータとダブルクリックによるインライン編集に対応。
- **🧡 Xiaomi 公式ショップ＆カート決済** (`/xiaomi-shop`, `/xiaomi-shop/cart`)：27万行超の JSON データ (`public/shop-json/xiaomi-shop.json`) で駆動、`cartStore` 永続化、サイド引き出しカート (`CartDrawer.vue`)、フルスクリーンカート画面 (`/xiaomi-shop/cart`)、住所選択、クーポン適用（`MI888` 割引）および WeChat / Alipay 決済に対応。
- **🔐 権限管理コントロールセンター** (`/permission`)：4 つの RBAC 役割（スーパー管理者、インフラ、運用、ゲスト）の切り替え、ディレクティブ権限 (`v-permission`)、JWT デコード確認、HTTP ステータスコード直接ジャンプに対応。
- **📜 システム監査ログ** (`/logs`)：API ステータスコード、セキュリティブロック、スタックトレースをリアルタイムで追跡し CSV 出力に対応。
- **🚫 HTTP ステータスコード＆エラー画面** (`/200`, `/401`, `/402`, `/403`, `/404`, `/405`, `/500`)：ワンクリック自動修復機能付きのインタラクティブなステータス画面。
- **📘 掘金小冊コースページ** (`/juejin-course`)：掘金の小冊コース一覧とカテゴリを同期し、最新／人気／価格ソート、VIP コース絞り込み、キーワード検索、作者ページ遷移、詳細ページ遷移、活動割引価格、カウントダウン、書籍単位の VIP バッジに対応。
- **🧭 内部ニュースハブ**：`/ai-xxx/:section`、`/jandan`、`/tophub`、`/ithome`、`/huxiu`、`/github` を追加。AI リソース、煎蛋、TopHub、IT之家、虎嗅 24 時間、GitCN/Githot/HelloGitHub を内部ページで表示し、読み込み中は明示的な loading、操作ボタンの無効化、ページネーション制御、HelloGitHub 画像プロキシと代替カードを提供します。
- **♡ 記録キャッシュ表示ページ** (`/records-cache`)：收藏済みページ、收藏済みリスト内容、收藏済み記録カードのみをクラウドタグと 2 列カードで表示し、中継アクセスに対応します。取消前には確認ダイアログを表示します。
- **🚀 ワンクリックデプロイスクリプト**：内蔵シェルツール `scripts/deploy_update.sh` (`npm run deploy`) でローカルビルド、Git ステージング、コミット、GitHub 自動デプロイを実行。

## 🆕 最近の更新

- 🛑 **本番ホームページのアーカイブ Dialog**：本番ビルドと `npm run preview` のホーム表示時に毎回 Dialog を開き、リアルタイム時刻、クリック可能なメール連絡先、ALAPI ジョーク一覧、jQuery `animate(scrollTop)` の上方向スクロール、コピー操作を提供します。
- 🧭 **内部ニュースハブページを追加**：`/ai-xxx/:section`、`/jandan`、`/tophub`、`/ithome`、`/huxiu`、`/github` をルート化し、読み込み中は refresh・カテゴリ・ページネーション操作を無効化します。
- ♡ **記録キャッシュ表示とリスト收藏を追加**：`/records-cache` で收藏済みページ、收藏済みリスト内容、收藏済み記録カードだけを集約し、未收藏項目は表示しません。ニュースハブ、AI ニュース/アプリ/教程、掘金テーマ、HelloWorld の各リストで收藏/取消でき、取消時は確認ダイアログを表示します。
- 🧷 **ページネーションと画像表示を改善**：虎嗅のページネーションは現在ページと近接ページを表示。IT之家、煎蛋、TopHub、GitHub 集約の loading 状態を統一し、HelloGitHub 画像はローカルプロキシと代替カードに対応。月刊目录には「更早」ボタンで 1-95 期を展開できます。
- 📘 **掘金小冊コースページを追加** (`/juejin-course`)：掘金コースデータを表示し、カテゴリ、価格ソート、VIP 絞り込み、割引カウントダウン、活動割引価格、作者ページ、コース詳細リンクに対応しました。
- 🧩 **上部の「Web Components & Libraries」メニューを分類化**：新規ページ、コンポーネントと UI、アニメーションとスケジュール、地図とグラフ、開発ツール、ドキュメントを分けて表示します。
- 🌾 **Oat UI Studio (`/oat-studio`) を追加**：Oat.ink 公式 26 項 WebComponent ライブラリ (Dropdown, TagInput, Upload, Tabs) および Element Plus 64 項コンポーネントサイドバー、Element Plus Dialog および Naive UI OS-Theme Dialog 公式設計バナー、400 件の表ダブルクリック編集機能を追加しました。

- 🧡 **Xiaomi 公式ショップ＆ショッピングカートを追加** (`/xiaomi-shop`, `/xiaomi-shop/cart`)：27万行超の JSON データ、永続化カート引き出し、インタラクティブ決済に対応しました。
- 🛠️ ワンクリックデプロイツール `scripts/deploy_update.sh` (`npm run deploy`) を追加し、GitHub Actions のビルドメモリ上限を 8GB (`NODE_OPTIONS="--max-old-space-size=8192"`) に最適化しました。
- 🔐 **権限コントロールセンター** (`/permission`) を追加し、RBAC ロール切り替えと HTTP ステータスジャンプに対応しました。
- 📜 **システム監査ログセンター** (`/logs`) を追加しました。**リアルタイムデータ同期**：リモートデータソースからリアルタイムに取得してローカル静的データとマージ、失敗時はローカルデータに自動フォールバック
- **グローバル検索**：名前／説明でカテゴリ横断検索、検索履歴付き（最大 8 件）
- **ブラウザ互換性通知**：アプリ上部でブラウザ機能を確認し、Element Plus Dialog で 5 つの公式ブラウザダウンロードリンク、QR コード、現在時刻、作者 GitHub、年始メッセージ、`package.json` から読み取ったソフトウェアバージョンリンクを表示
- **お気に入り**：ツールカードのいいね・お気に入り、ローカルに永続化、履歴の閲覧が可能
- **コントロールセンターリソース**：右側メニューにクラウドドライブ資料、AI 開発ツール公式サイト、ツール説明をまとめて表示し、新しいタブで開けます
- **AI ニュース＆アプリ**：毎日の AI ニュースタイムライン、IT之家 API タグのページングニュース、AI アプリストア、AI チュートリアル／百科事典記事リスト
- **ホットランキング＆映像データ**：微博、Bilibili ホット検索、掘金、OSChina などのランキング、映画興行収入と映像ランキングに対応
- **API ツールボックス**：よく使う API コレクションを内蔵
- **テーマ切替**：ダーク／ライトテーマをワンクリックで切替、設定をローカルに保存
- **カスタムレイアウト**：グリッド列数の調整（ローカルに保存）、サイドバーの折りたたみ
- **コンテキストメニュー**：ツールカードで「新しいタブで開く／リンクをコピー」に対応

## 🆕 最近の更新

- `/bilibili-live` ページを追加し、入室後にライブデータを取得、Bilibili ライブ分区と子カテゴリを動的に同期し、推薦／人気／最新配信の切り替えに対応しました。
- LOLM 中国サーバーデータのローカル／オンライン環境対応を修正。開発環境は Vite プロキシ、本番環境は読み取り専用のラップ済み JSON 取得を使い、ツールボックスの表は返却された英雄リスト全体をスクロール表示できます。
- `/bilibili-trending` の更新処理を改善し、カウントダウン付き更新は検索ホットリストのみを対象にし、他の Bilibili ランキングは独立した読み込み／エラー状態を持つようにしました。
- 掘金ホットランキングは本番環境でビルド時生成の同一オリジンキャッシュを使用し、GitHub Pages で直接クロスオリジンリクエストを行わないようにしました。
- ホームページと独立ルート画面の上部にブラウザ互換性検出バーを追加し、詳細は Element Plus Dialog で表示、QR 画像は `src/assets/qc/` に配置しました。
- コントロールセンターにクラウド資料リンク、Codex / TRAE / Devin / Antigravity の公式入口、動的な年表示の祝福文を追加しました。
- `/api-uapis`、`/api-aa1`、`/api-ithome` のローカルプロキシを追加し、ブラウザの CORS 問題を回避。
- Bilibili ホット検索は aa1 の Bilibili API を優先し、失敗時は既存のホットボードソースへフォールバック。
- `ai-bot.cn/daily-ai-news` の毎日 AI ニュースを保持しつつ、IT之家 `NewsTag=API` のページングソースを追加。
- 映像ランキングは uapis の新しい `groups` レスポンス形式に対応し、利用不可時はモックではなく実際のエラーを表示。

## 🎮 内蔵ミニゲーム

倉庫番、スネーク、テトリス、2048、マインスイーパー、三目並べ、ブロック崩し、バトルシティ、Flappy Bird、スペースシューター、フルーツキャッチャーなど。

## 🧰 その他の内蔵コンポーネント

- ミュージックプレーヤー（ミニプレーヤー付き）
- 画像エディタ（cropperjs / vue-advanced-cropper ベース）
- アナログ時計
- ダイナミックフォーム

## 🛠️ 技術スタック

| カテゴリ | 技術 |
| --- | --- |
| フレームワーク | Vue 3（`<script setup>` SFC） |
| ビルド | Vite 8 |
| UI | Element Plus |
| ルーター | Vue Router 4 |
| その他 | axios、vuedraggable、cropperjs |

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# ビルド成果物のプレビュー
npm run preview
```

`npm run preview` は本番ビルド成果物を配信するため、ホームページのアーカイブ Dialog も本番ルール通り表示されます。

## ✅ テストと検証

```bash
# MCP ナビゲーションデータの検証
npm run validate:mcp

# テストの実行
npm run test:mcp
npm run test:navigation
npm run test:games
```

## 📁 ディレクトリ構成

```
├── src/
│   ├── App.vue              # メイン UI（ナビゲーション、検索、テーマなど）
│   ├── components/          # コンポーネント
│   │   ├── games/           # ミニゲームコンポーネント
│   │   ├── image/           # 画像エディタ
│   │   ├── ApiToolbox.vue   # API ツールボックス
│   │   ├── AiNewsTimeline.vue  # AI ニュースタイムライン
│   │   └── ...
│   ├── utlis/               # ツールデータと JSON データソース
│   ├── router/              # ルーター
│   └── style/               # グローバルスタイル
├── scripts/                 # 検証・テストスクリプト
└── vite.config.ts
```

## 📄 License

当プロジェクトは [MIT License](./LICENSE) に基づいてオープンソースとして公開されています。Fork や二次開発ご自由にご活用ください！
