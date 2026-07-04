@AGENTS.md

# Orange Sheep Portfolio — Claude Code 工作規則

## 專案概要

個人作品集網站。Next.js（App Router）+ TypeScript + Tailwind CSS，多語系（zh-TW/en，`next-intl`），內容用 Velite 型別安全資料層管理（無資料庫）。

**GitHub**：https://github.com/tanyangbrocks/Orange-Sheep-Portfolio.git
**本地路徑**：`C:\Portfolio\`

## 必讀文件

- `實作進度.md` — 目前狀態、最新完成、待辦（**每次啟動先看這裡**）
- `docs/plan-portfolio-website.md` — 完整實作計畫（關鍵資源決策、技術選型、內容資料架構、分階段步驟）

---

## 強制規則

### 🔴「列出實作計畫」= 建立 `docs/plan-*.md` 檔案

使用者說「列出實作計畫」時，預設動作是建立一份 `docs/plan-<功能名稱>.md` 文件，不是直接回覆在對話中。

### 🔴 每次實作完成後必須更新 `實作進度.md`

完成任何功能後，立刻更新根目錄的 `實作進度.md`：
- 「目前狀態」一行摘要
- 「最新完成」表格新增一列（功能 / 關鍵檔案 / 摘要）
- 「待辦」勾選對應項目
- 更新標頭「最後更新」日期

### 🔴 歷史歸檔

「最新完成」表格超過 5 筆時，執行：

```
powershell -ExecutionPolicy Bypass -File docs\archive-done.ps1
```

把舊紀錄移到 `docs/history/completed.md`（保留最新 5 筆）。腳本用 `[char]` code point 定位 `實作進度.md` 檔名，避免中文檔名在腳本原始碼裡的編碼問題；表格辨識邏輯是抓檔案裡第一個 markdown table 分隔線，所以「最新完成」必須是檔案裡第一個表格。

### 🔴 Commit 粒度

功能完成 + `實作進度.md` 同步 = 一個 commit。不要把進度更新單獨拆成獨立 commit。

### 🔴 Build 必須 0 錯誤 0 警告

每次改完程式碼都跑：

```
npm run build   # Turbopack build + TypeScript 型別檢查
npm run lint    # ESLint
```

有錯立刻修，不要留著。

### 🔴 改動設定檔後需重啟 dev server

`next.config.ts`、`tsconfig.json` 的 `paths`、`.env*`、`velite.config.ts` 的 **schema 定義**變更不會被 `next dev` 的 hot reload 偵測到，需要重啟 dev server 才會生效。（`content/works/*.yml` 的資料內容本身有 Velite watch mode 會自動重建，不用重啟；差別在於「改資料」vs「改 schema/設定」。）

### 🔴 最小化使用者手動操作

能用程式碼/設定檔解決的，不要求使用者手動點介面操作：

- 新增分類 → 改 `content/categories.ts`
- 新增作品 → 在 `content/works/` 加 YAML 檔
- UI 元件 → `npx shadcn@latest add <component>`

**唯一必須使用者手動的例外**：Vercel 帳號登入 / 連接 GitHub repo 做部署授權、購買網域與設定 DNS——這些是帳號層級操作，AI 無法代為完成，遇到時要明確告知使用者「這一步需要你自己做」，不要嘗試繞過或假裝完成。

---

## 擴充速查（新增內容時必看）

### 新增作品分類

1. `content/categories.ts` 的 `categories` 陣列加一筆 `CategoryConfig`（`id`/`name`/`subcategories`/`fields`）
2. 不需要改 `WorkEntry` schema（`velite.config.ts` 是欄位超集設計，全部選填，新分類不用的欄位不填即可）
3. `messages/zh-TW.json` 與 `messages/en.json` 的 `categories` 區塊加對應翻譯 key

### 新增作品項目

1. `content/works/` 新增一個 `.yml` 檔（欄位依 `velite.config.ts` 的 schema）
2. 圖片放 `public/works/`
3. `npm run dev` 期間 Velite watch mode 會自動偵測重建，不用重啟

### 新增 UI 元件

- `npx shadcn@latest add <component>`
- ⚠️ 這個專案的 shadcn/ui 版本底層是 **Base UI**（不是 Radix）：`asChild` 這個 prop 不存在，要改用 `render={<a .../>}` 的寫法把渲染的元素換掉（見 `src/app/[locale]/works/[slug]/page.tsx` 的 Button 用法）

### 新增翻譯字串

- `messages/zh-TW.json` 與 `messages/en.json` **兩個檔案必須同步新增相同的 key**，否則其中一個語系會找不到翻譯

---

## 模組結構

```
Portfolio/
├── src/
│   ├── app/[locale]/        App Router 頁面（locale-based routing）
│   │   └── template.tsx      路由層級頁面轉場動畫（Framer Motion）
│   ├── components/          共用元件（shadcn/ui 元件在 components/ui/）
│   ├── i18n/                next-intl 設定（routing/navigation/request）
│   └── lib/                 工具函式（works.ts：讀取/篩選/在地化 Velite 資料）
├── content/
│   ├── works/                作品資料（.yml，Velite 驗證）
│   └── categories.ts         分類設定（含子分類、欄位開關、雙語顯示名稱）
├── messages/                  next-intl 翻譯檔（zh-TW.json / en.json）
├── docs/                      計畫文件 + 歷史歸檔 + 歸檔腳本
└── velite.config.ts           內容資料 schema 定義（WorkEntry）
```
