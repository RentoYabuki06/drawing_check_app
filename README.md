# Drawing Check App

## プロジェクト概要

Drawing Check App（図面チェックアプリ）は、設計図面の自動チェックを行うNextJSベースのウェブアプリケーションです。このアプリを使用することで、以下の図面チェックを効率的に実行できます：

- 部品マッピングチェック
- 部品対応表チェック
- 寸法抜け漏れチェック
- 自社規格チェック

## 機能

- PDFファイルのアップロードと画像への変換
- 図面のトリミング機能
- AIによる複数の図面チェック実行
- 結果の詳細レポートと視覚化
- ズーム可能な結果ビューア

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/drawing_check_app.git
cd drawing_check_app

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 使用技術

- **フロントエンド**: React, Next.js, Material UI
- **状態管理**: React Hook Form
- **PDF処理**: PDF.js
- **画像操作**: react-cropper, react-zoom-pan-pinch
- **AIサービス**: AWS Bedrock (Claude)
- **インフラ**: AWS Amplify

## 使い方

1. **アップロード・検査項目選択**
   - 図面PDFをアップロード
   - 必要なチェック項目を選択（複数選択可能）
   - 自社規格チェックを選択した場合は規格書PDFも必要

2. **図面トリミング**
   - 必要な箇所（部品表、部品配置箇所など）をトリミング
   - 選択したチェック項目に応じて必要なトリミングが示されます

3. **結果出力**
   - 「送信」ボタンをクリックして検査を開始
   - 検査結果が詳細に表示されます

## 開発情報

### 実行スクリプト

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# リント実行
npm run lint
```

### プロジェクト構成

```
src/
  app/            # Next.jsアプリケーションページ
  components/     # React UI コンポーネント
    Zumen/        # 図面関連コンポーネント
      templates/  # 図面処理テンプレート
  const/          # 定数ファイル
amplify/          # AWS Amplify関連設定
public/           # 静的ファイル
```

