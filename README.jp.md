# HooksVue AI ナビゲーションツールボックス

[简体中文](./README.md) | [English](./README.en.md) | 日本語

Vue 3 + Vite で構築されたフロントエンド AI ツールナビゲーションサイトです。AI チャットアシスタント、AI ペイント、AI プログラミング、AI 開発プラットフォームなど、さまざまなツールの入り口を集約し、複数のミニゲームと便利なツールを内蔵しています。

## 📌 メンテナンス状況

このプロジェクトは継続的な更新を終了しました。現在のオンラインデモと既存機能のみをそのまま保持し、新機能追加、API 同期、第三者データソースの可用性維持は予定していません。

## 🌐 オンラインデモ

- 🌾 **Oat UI スタジオ演習センター**：[https://mhxy13867806343.github.io/front-end-navigation-bar/oat-studio](https://mhxy13867806343.github.io/front-end-navigation-bar/oat-studio)
- 🏠 **ホーム**：[https://mhxy13867806343.github.io/front-end-navigation-bar/](https://mhxy13867806343.github.io/front-end-navigation-bar/)
- 🧡 **Xiaomi 公式ショップ**：[https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop)
- 🛒 **Xiaomi ショッピングカート**：[https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart](https://mhxy13867806343.github.io/front-end-navigation-bar/xiaomi-shop/cart)
- 🔐 **権限管理コントロールセンター**：[https://mhxy13867806343.github.io/front-end-navigation-bar/permission](https://mhxy13867806343.github.io/front-end-navigation-bar/permission)
- 📜 **システムセキュリティ監査ログ**：[https://mhxy13867806343.github.io/front-end-navigation-bar/logs](https://mhxy13867806343.github.io/front-end-navigation-bar/logs)
- 🚫 **500 / 404 / 401 エラーページ**：[https://mhxy13867806343.github.io/front-end-navigation-bar/500](https://mhxy13867806343.github.io/front-end-navigation-bar/500)
- 🌦️ **天気予報ビジュアル**：[https://mhxy13867806343.github.io/front-end-navigation-bar/weather](https://mhxy13867806343.github.io/front-end-navigation-bar/weather)

## ✨ 主な機能

- **🌾 Oat UI Studio (`/oat-studio`)**：[Oat.ink 公式 26 項コンポーネント](https://oat.ink/components/) (Dropdown, TagInput, Upload, Tabs WC) と Element Plus 64 項のコンポーネントディレクトリを集成。**Element Plus Dialog** と **Naive UI OS-Theme Dialog** 的設計仕様を融合。400 件のサンプルデータとダブルクリックによるインライン編集に対応。
- **🧡 Xiaomi 公式ショップ＆カート決済** (`/xiaomi-shop`, `/xiaomi-shop/cart`)：27万行超の JSON データ (`public/shop-json/xiaomi-shop.json`) で駆動、`cartStore` 永続化、サイド引き出しカート (`CartDrawer.vue`)、フルスクリーンカート画面 (`/xiaomi-shop/cart`)、住所選択、クーポン適用（`MI888` 割引）および WeChat / Alipay 決済に対応。
- **🔐 権限管理コントロールセンター** (`/permission`)：4 つの RBAC 役割（スーパー管理者、インフラ、運用、ゲスト）の切り替え、ディレクティブ権限 (`v-permission`)、JWT デコード確認、HTTP ステータスコード直接ジャンプに対応。
- **📜 システム監査ログ** (`/logs`)：API ステータスコード、セキュリティブロック、スタックトレースをリアルタイムで追跡し CSV 出力に対応。
- **🚫 HTTP ステータスコード＆エラー画面** (`/200`, `/401`, `/402`, `/403`, `/404`, `/405`, `/500`)：ワンクリック自動修復機能付きのインタラクティブなステータス画面。
- **🚀 ワンクリックデプロイスクリプト**：内蔵シェルツール `scripts/deploy_update.sh` (`npm run deploy`) でローカルビルド、Git ステージング、コミット、GitHub 自動デプロイを実行。

## 🆕 最近の更新

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

## 📄 ライセンス

MIT
