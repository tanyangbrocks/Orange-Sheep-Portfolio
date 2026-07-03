# 個人作品集網站 — 實作計畫

最後更新：2026-07-03

## 一、專案目標

打造一個能展示多領域作品的個人網站，需求：
- 有動態特效（進場動畫、hover 互動、頁面轉場）
- 每筆作品可存放：專案連結、圖片、文字敘述
- 不只放程式/遊戲專案，也要能放設計資產、插畫、圖像、外部平台連結（如 ArtStation、itch.io、LinkedIn 等）
- **需要多語系**（中文/英文切換）

## 二、關鍵資源決策

| 問題 | 決策 | 理由 |
|------|------|------|
| 資料庫 | **不使用**，內容以 Git 內的靜態資料檔（JSON/MDX）管理 | 使用者選擇圖片存在專案內 Git，內容更新頻率低，靜態方案最簡單、免費、無維護負擔；未來要做後台再升級成 CMS |
| 網域 | 先用 **Vercel 免費子網域**（`*.vercel.app`） | 使用者選擇先免費上線，之後可隨時外加自訂網域綁定，不影響架構 |
| 媒體檔案 | 圖片/影片放在**專案內 Git**（`public/` 目錄） | 使用者選擇專案內儲存；適合圖片數量不多、單檔不大的情境 |
| 專案位置 | 全新獨立資料夾 `C:\Portfolio`，獨立 git repo，連接 GitHub `tanyangbrocks/Orange-Sheep-Portfolio` | 與 `C:\SkillCreatorUE5` 完全分開，避免混用 |

**風險提醒**：若未來圖片/影片數量變多（例如高解析度美術作品、影片 demo），Git repo 體積會膨脹、Vercel 部署變慢，屆時需評估搬到雲端物件儲存（Cloudinary/S3/Vercel Blob）。此為已知的擴充點，非目前必須處理。

## 三、技術選型

| 項目 | 選擇 |
|------|------|
| 項目 | 選擇 | 優先度 |
|------|------|--------|
| 框架 | Next.js（App Router）+ TypeScript | 必裝 |
| 樣式 | Tailwind CSS | 必裝 |
| UI 元件庫 | `shadcn/ui`（Radix UI + Tailwind，無障礙、可完全客製化樣式） | 必裝 |
| Icon | `lucide-react` | 必裝 |
| 字型 | `next/font`（自架字型，避免載入造成版面跳動 CLS） | 必裝 |
| 動畫 | Framer Motion（進場動畫、hover、頁面轉場） | 必裝 |
| 多語系 | `next-intl`（App Router 官方推薦的 i18n routing 方案，`/zh-TW/...`、`/en/...`） | 必裝 |
| 內容型別驗證 | `Velite` 或 `Contentlayer`（二選一，build time 驗證 `content/works/` 資料 schema、產生型別） | Phase 1 決定 |
| 內容格式 | 每筆作品一個 JSON/YAML 或 MDX 檔案，放在 `content/works/`；標題/敘述本身內嵌雙語欄位（見下方 schema），不用整份檔案複製兩份 | 必裝 |
| 圖片優化 | Next.js `<Image>` 元件（自動 lazy load + 壓縮） | 必裝 |
| 深色模式 | `next-themes` | 加分項 |
| 平滑捲動 | `Lenis`（搭配 Framer Motion `whileInView` 提升 scroll 質感） | 加分項 |
| 3D/互動背景 | `react-three-fiber`（Three.js） | 加分項，暫不排入 Phase 1-4，複雜度高、bundle 較大 |
| SEO | Next.js 內建 Metadata API | 必裝，不需額外套件 |
| Bundle 體積檢查 | `@next/bundle-analyzer` | 加分項（Phase 4 上線前跑一次） |
| 效能監測 | Vercel Analytics + Speed Insights（Vercel 免費方案內建） | 加分項（Phase 4 部署後開啟） |
| 部署 | Vercel（免費方案，`*.vercel.app` 子網域） | 必裝 |
| 版本控制 | 獨立 Git repo，已連接 GitHub [`tanyangbrocks/Orange-Sheep-Portfolio`](https://github.com/tanyangbrocks/Orange-Sheep-Portfolio.git) | 必裝 |

## 四、內容資料架構

### 分類（category）— 可持續擴充

目前四大分類，每類欄位需求不同；`專案` 底下還有子分類（工具、遊戲，可再增加）：

| 分類 | 子分類 | 標題 | 敘述 | 預覽 | 連結 | 下載點 |
|------|--------|------|------|------|------|--------|
| 專案 (project) | 工具/遊戲，可擴充 | ✓ | ✓ | 選填 | ✓ | ✓ |
| 設計資產 (designAsset) | — | ✓ | ✓ | ✓ 示意圖 | ✓ | ✓ |
| 商業領域 (business) | — | ✓ | ✓ | ✓ 檔案預覽 | ✓ | ✓ |
| 創作領域 (creative) | — | ✓ | ✓ | ✓ 檔案預覽 | ✓ | ✗ 無下載點 |

由於分類會持續新增、且各分類欄位需求差異只在於「有沒有用到某個欄位」而非結構完全不同，採用**單一超集 schema**（所有欄位設為選填，未使用的分類就不填）比每個分類各自定義型別更簡單、更容易擴充：

```ts
type Locale = 'zh-TW' | 'en';
type LocalizedText = Record<Locale, string>;

type WorkEntry = {
  slug: string;                 // URL 用識別碼
  category: string;             // "project" | "designAsset" | "business" | "creative" | ...（未來可再加）
  subcategory?: string;         // 目前僅 project 底下用，例如 "tool" | "game"，未來可再加
  title: LocalizedText;
  description: LocalizedText;   // 可含 markdown
  previewImages?: string[];     // 示意圖 / 檔案預覽（designAsset/business/creative 用）
  links?: { label: string; url: string }[]; // 專案連結 / 外部平台連結
  downloadUrl?: string;         // project / designAsset / business 用；creative 不填
  tags?: string[];              // 篩選用標籤
  date: string;                 // 用於排序
  featured?: boolean;           // 首頁精選
};
```

分類本身（含子分類、該分類要顯示哪些欄位、UI 顯示用的雙語名稱）另外存一份 `content/categories.ts` 設定檔，新增分類只要在這裡加一筆，不用改版型元件或 `WorkEntry` 型別。

新增作品 = 在 `content/works/` 新增一個資料檔 + 對應圖片放進 `public/works/`，不需要改版型程式碼。

## 五、頁面與元件規劃

1. **首頁**
   - Hero 區塊（自我介紹 + 動態進場動畫）
   - 精選作品（`featured: true`）橫向或 grid 展示
   - 導覽到各分類 / About / 外部平台連結
   - 語言切換器（中/英）
2. **作品列表頁**
   - Grid/Masonry 版面，依 `category`／`subcategory`／`tags` 篩選（無需頁面切換，用 client-side 篩選）
   - 卡片 hover 特效（縮放、陰影、覆蓋文字淡入）
3. **作品詳細頁（或 Modal）**
   - 預覽圖/檔案預覽 gallery、完整文字敘述（依當前語言顯示）、外部連結按鈕、下載按鈕（該分類有 `downloadUrl` 才顯示）
4. **About / Contact**
   - 簡介 + 連結到其他平台（社群、履歷 PDF 等）
5. **共用動畫**
   - 頁面轉場（Framer Motion `AnimatePresence`）
   - Scroll-triggered 進場動畫（`whileInView`）
6. **語言切換**
   - `next-intl` 處理 UI 文案（導覽列、按鈕、分類名稱）的雙語
   - 作品內容的雙語（標題/敘述）直接讀 `WorkEntry.title[locale]` / `description[locale]`，不需要另外的翻譯檔案系統

## 六、分階段實作步驟

- **Phase 1 — 專案骨架 + 多語系底座**
  - `create-next-app`（TypeScript + Tailwind）
  - 導入 `next-intl`，設定 `/zh-TW`、`/en` routing 與語言切換器
  - 導入 `shadcn/ui`、`lucide-react`、`next/font`
  - 決定並導入 `Velite` 或 `Contentlayer`
  - 建立資料夾結構（`content/works/`, `content/categories.ts`, `components/`, `app/`）
  - 定義 `WorkEntry` 型別、`categories.ts` 分類設定、讀取資料的工具函式
- **Phase 2 — 核心頁面與資料串接**
  - 首頁、作品列表頁（含分類/子分類篩選）、作品詳細頁
  - 先用四大分類各 1-2 筆假資料（含雙語內容）測試版型彈性，特別驗證「creative 沒有下載點」這種欄位差異
- **Phase 3 — 動態特效**
  - 導入 Framer Motion：hover、進場、頁面轉場
  - （加分項）導入 `Lenis` 做平滑捲動
- **Phase 4 — 內容填充 + 部署**
  - 使用者提供真實作品資料（雙語）與圖片
  - 跑一次 `@next/bundle-analyzer` 確認 bundle 體積合理
  - 部署到 Vercel，取得免費子網域，開啟 Vercel Analytics + Speed Insights
- **Phase 5（未來擴充，非本次範圍）**
  - 視需求評估：自訂網域、CMS 後台（含資料庫）、雲端圖床、新增更多分類/子分類、`next-themes` 深色模式、`react-three-fiber` 3D 互動背景

## 七、待確認事項

- 目前四大分類已確認：專案（含工具/遊戲子分類）、設計資產、商業領域、創作領域，欄位差異已反映在 schema 中；之後新增分類時只需更新 `content/categories.ts`，不影響架構。
- 尚待補齊：實際的雙語文案（各分類的中/英名稱顯示文字）、以及第一批要上架的真實作品資料，Phase 2 開始前可陸續提供。
