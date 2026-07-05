# 行動裝置友善性 — 評估與實作計畫

最後更新：2026-07-05

## 一、評估方法

用瀏覽器模擬 375×812（iPhone 尺寸）viewport，實際跑起 `npm run dev` 測試每個區塊，並用 DOM 量測（`getBoundingClientRect`、`scrollWidth` 等）取得實際數字，不是憑觀感猜測。以下是實測發現的問題，依嚴重度排序。

## 二、發現的問題

### 問題 1（嚴重）：導覽列在手機寬度沒有摺疊機制

**現況**：`SiteHeader`（`src/components/site-header.tsx`）目前所有裝置都顯示同一套橫向導覽列（Logo + 4 個分頁連結 + 語言切換器），沒有依螢幕寬度切換成漢堡選單。

**實測數字**（375px 寬視窗）：
- 導覽列文字全部擠壓換行（例如「關於我」變成「關於」換行「我」）
- 語言切換器「en」按鈕的可點擊範圍只有 **13.2 × 20 px**，「zh-TW」是 23.3 × 40 px，「背景經歷」「代表作品」連結是 28.9 × 44 px
- 對照標準：WCAG 2.5.8（AA）最低要求 24×24 px，Apple/Google 行動裝置設計指南建議 44×44 px 以上——「en」按鈕明顯低於最低標準，其餘也偏緊繃，手指容易誤觸旁邊的項目

**連帶影響（次生問題）**：`site-header.tsx` 裡的 scroll-spy 與捲動定位邏輯用了寫死的常數 `HEADER_OFFSET = 96`（單位 px），假設導覽列高度固定。但手機寬度文字換行後，導覽列實際高度會超過這個假設值。實測驗證：點擊「代表作品」捲動過去後，畫面內容已經是「代表作品」區塊，但底線指示器卻還停在「背景經歷」——這就是因為換行讓導覽列變高，`HEADER_OFFSET` 算出的捲動基準線因此偏移。

### 問題 2（中）：`next/image fill` 缺少 `sizes` 屬性

**現況**：三個用到 `<Image fill>` 的地方都沒有設定 `sizes`：
- `src/components/work-card.tsx`
- `src/components/experience-timeline.tsx`
- `src/app/[locale]/works/[slug]/page.tsx`（作品詳情頁 gallery）

**影響**：`fill` 模式下沒填 `sizes`，Next.js 預設用 `sizes="100vw"`，意味著瀏覽器永遠下載「整個裝置寬度」對應的圖片斷點，而不是元件實際渲染的寬度。例如作品卡片在桌面版是 3 欄網格裡的一小格（約 300px 寬），卻會下載給 100% 螢幕寬度用的大圖——在行動網路（4G/5G 有流量或速度限制）上這是不必要的頻寬浪費，會拖慢首次載入。

### 問題 3（輕微／待驗證）：Lenis 平滑捲動在觸控裝置的手感未特別調校

**現況**：`layout.tsx` 用 `<ReactLenis root>` 沒有額外帶入 `options`，全部吃 Lenis 預設值。Lenis 預設在觸控裝置上通常會退回原生慣性捲動（不會用 JS 強制接管），行為上「理論上」沒問題，但 viewport 模擬無法真的模擬手指觸控/慣性滑動的手感，所以這項只能列為「待實機驗證」，不在本次程式碼改動範圍。

### 已確認沒問題的項目

- 無水平溢出（`document.body.scrollWidth` 在所有測試寬度都等於 `window.innerWidth`）
- `WorksFilter` 的分類篩選 tabs（全部/專案/設計資產/商業領域/創作領域）在 375px 寬度下完整一行顯示，沒有溢出或截斷
- `IntroHero` 兩欄版型已經有 `lg:grid-cols-[...]` 響應式斷點，手機寬度會正確疊成單欄
- Next.js 預設已經有正確的 `<meta name="viewport">` 標籤

## 三、建議的資源／架構

**不需要引入新的執行期套件**：

| 需求 | 方案 | 說明 |
|------|------|------|
| 手機漢堡選單 | `shadcn` 的 `Sheet` 元件 | 用 `npx shadcn@latest add sheet` 安裝；底層一樣是這個專案已經在用的 `@base-ui/react`（`dialog.tsx` 已經證明能用），不會新增依賴套件 |
| 響應式斷點判斷 | Tailwind 既有的 `sm:`/`md:`/`lg:` class | 專案已經在用，不需要額外的 media query library 或 CSS-in-JS 方案 |
| 導覽列高度量測 | React `useRef` + `ResizeObserver`（瀏覽器原生 API） | 取代寫死的 `HEADER_OFFSET` 常數，不需要額外套件 |
| `next/image` 尺寸優化 | 手動補 `sizes` 屬性 | Next.js 內建功能，不需要額外套件 |

## 四、實作步驟（分階段，待確認後才動手）

1. **導覽列手機版摺疊選單**
   - 安裝 `Sheet` 元件
   - `md` 以下寬度：隱藏橫向 nav，顯示一個漢堡選單按鈕（至少 44×44px 點擊區）
   - 點開後用 `Sheet` 從側邊滑出，直向列出 4 個分頁連結（每個至少 44px 高的點擊區）+ 語言切換器（加大兩個按鈕的點擊區到至少 24×24px，中間留足夠間距）
   - `md` 以上寬度維持現在的橫向導覽列不變

2. **`HEADER_OFFSET` 動態化**
   - `site-header.tsx` 的 `<header>` 加 `ref`，用 `ResizeObserver` 量測實際渲染高度，取代寫死的 `96`
   - scroll-spy 判斷邏輯與 `lenis.scrollTo()` 的 offset 參數都改吃這個動態值
   - 這樣即使未來導覽列內容/字體大小再變，也不用回頭改魔術數字

3. **`next/image` 補 `sizes` 屬性**
   - `work-card.tsx`：依網格斷點設定，例如手機全寬、`sm:` 兩欄各半寬、`lg:` 三欄各三分之一寬
   - `experience-timeline.tsx`：依時間軸圖片固定寬度（`sm:w-48`）設定對應的 `sizes`
   - `works/[slug]/page.tsx` gallery：依 `sm:grid-cols-2` 設定

4. **驗證**
   - `npm run build` / `npm run lint` 0 錯誤 0 警告
   - 重新用 375px 模擬視窗跑一次問題 1 的量測項目，確認觸控區與 scroll-spy 都修正
   - 建議額外用 Chrome DevTools 的 Lighthouse（Mobile 模式）跑一次稽核，抓有沒有遺漏的項目
   - 若方便，用實機測試 Lenis 觸控捲動手感（問題 3），非必要不特別改動

## 五、影響範圍

- `SiteHeader` 改動較大（新增手機選單開關的 client-side 狀態、`Sheet` 元件、`ResizeObserver`），但對外的 props 介面不變，其他頁面不用跟著改
- 不影響 Velite 內容資料結構或現有 schema
- 不需要新增執行期依賴套件（`Sheet` 用既有的 `@base-ui/react`）
- 不影響已上線的 Vercel 部署行為
