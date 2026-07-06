# 右上角圓形選單（深色模式 + 多語系）— 實作計畫

最後更新：2026-07-07

## 一、目標

把目前右上角的文字型語系切換（`zh-TW` / `en` 兩顆純文字按鈕）換成一顆圓形按鈕。點擊後由該按鈕下方，由右向左彈出兩顆氣泡按鈕，上方氣泡彈出時間略快於下方，營造波浪感；未來要再加更多氣泡按鈕時，架構上要能直接擴充，不用重寫。

- **氣泡 1（上）**：點擊切換深色 / 淺色模式
- **氣泡 2（下）**：點擊後在該氣泡左側、由右向左跳出一個語言選單，包含 8 種語言：繁體中文、英文、日文、韓文、俄文、德文、法文、西班牙文

另外兩項視覺調整：
- 淺色模式底色換成使用者提供的參考圖片顏色（暖色調米白/奶油色）
- 新增一個「醒目色」給部分文字使用，比新底色深、但同色系，避免突兀

**本次只列計畫，不實作。**

## 二、現況調查

| 項目 | 現況 | 影響 |
|------|------|------|
| 語系切換 UI | `src/components/language-switcher.tsx`：純文字 `<button>` 清單，目前只列 `zh-TW`/`en` 兩個 | 整個換掉，改成新元件的一部分 |
| 語系切換掛載點 | `src/components/site-header.tsx` 桌面版 nav 尾端 + 手機版 `Sheet` 選單底部，各掛一份 `<LanguageSwitcher />` | 兩處都要換成新元件；手機版排版是否要跟桌面版一樣的「圓形按鈕彈氣泡」互動方式，見「五、待確認事項」 |
| 支援語言 | `src/i18n/routing.ts` 的 `locales: ['zh-TW', 'en']`，`defaultLocale: 'zh-TW'` | 需擴充到 8 語言；`next-intl` 的 `createNavigation`/`middleware`（`src/proxy.ts`）/ `generateStaticParams`（各頁面用 `routing.locales.flatMap(...)`）都已經是泛用寫法，**不用改**，加陣列元素即可 |
| 翻譯檔 | `messages/zh-TW.json`、`messages/en.json`，各 24 個 key（`nav`/`home`/`work`/`categories` 四區） | 需要新增 `messages/{ja,ko,ru,de,fr,es}.json` 六份，每份對照翻譯這 24 個 key（見「四、6 之 3」） |
| 深色模式基礎設施 | `globals.css` 已經定義好 `.dark { --background: oklch(0.145 0 0); ... }` 一整組深色 CSS 變數，**但完全没有任何機制會把 `.dark` class 加到 `<html>`**——換句話說深色模式的樣式早就準備好了，只是從來沒有開關 | 需要引入 `next-themes` 套件 + `ThemeProvider`，`attribute="class"` 剛好對應現有的 `.dark` 選擇器，不用改 CSS 變數本身的深色那組值 |
| 作品內容雙語欄位 | `velite.config.ts` 的 `localizedText = s.object({'zh-TW': s.string(), en: s.string()})`，`content/works/*.yml` 目前只填 zh-TW/en 兩個 key | `src/lib/works.ts` 的 `localize(text, locale)` 用 `text[locale] ?? Object.values(text)[0]` 做 fallback，`text` 參數型別是寬鬆的 `Record<string,string>`，所以就算 `locale` 是新語言（如 `ja`）、物件裡沒有這個 key，也只是自然 fallback 回第一個值（目前是 zh-TW），**不會壞**、也不用改型別。也就是說**這次只擴充「網站介面文字」的 8 語言，不擴充「作品內容本身」的翻譯**（那是完全不同量級的工作，使用者沒有要求，本計畫排除在外） |
| 可用元件/圖示 | `src/components/ui/` 目前有 `button/badge/card/dialog/separator/sheet/tabs`，沒有 Popover 之類的浮層元件；`lucide-react` 已內建 `Sun`/`Moon`（深色切換）、`Globe`/`Languages`（語言選單）等圖示，`framer-motion` 已是既有依賴 | 氣泡彈出/語言選單用 Framer Motion 手刻動畫（跟現有 `photo-carousel.tsx`／`overscroll-bounce.tsx` 的手刻動畫風格一致），不需要额外的浮層元件庫 |

## 三、需要新安裝的套件

只有一個：

```
npm install next-themes
```

- 這是 Next.js App Router 深色模式的標準套件，處理「避免 SSR/CSR 第一幀顏色閃爍（FOUC）」「讀寫 `localStorage` 記住使用者選擇」「跟隨系統 `prefers-color-scheme`」這些細節，自己手刻風險較高（容易踩閃爍或水合不一致的坑）
- `attribute="class"` 模式下，它只是幫 `<html>` 加/拿掉 `.dark` class，跟現有 `globals.css` 的 `.dark { ... }` 完全相容，不用改 CSS
- 圖示（`Sun`/`Moon`/`Globe`）都已經在既有的 `lucide-react` 裡，不用額外裝

## 四、技術方案

### 1. 深色模式基礎設施

- `src/components/theme-provider.tsx`：包一層 `next-themes` 的 `ThemeProvider`（`'use client'`），設定 `attribute="class"`、`defaultTheme="system"`、`enableSystem`
- `src/app/[locale]/layout.tsx`：`<html>` 標籤加 `suppressHydrationWarning`（next-themes 官方要求，因為 SSR 當下不知道使用者的系統/儲存偏好，第一次水合前後 class 可能不同），並用 `ThemeProvider` 包住既有的 `ReactLenis` 那層

### 2. 語言擴充

- `src/i18n/routing.ts`：`locales` 陣列從 2 個擴到 8 個：`['zh-TW', 'en', 'ja', 'ko', 'ru', 'de', 'fr', 'es']`
- 新增 `messages/ja.json`、`messages/ko.json`、`messages/ru.json`、`messages/de.json`、`messages/fr.json`、`messages/es.json`，各自對照翻譯 `messages/en.json` 現有的 24 個 key
  - 這部分翻譯我可以直接生成（不需要额外套件/資源），品質是一般水準的機器翻譯等級；如果之後要用在正式對外的版本，建議請母語人士校過一次（尤其俄文/日文/韓文的敬語與慣用語感）
- 語言選單顯示用的「語言名稱」（例如「日本語」「한국어」而不是 locale code `ja`/`ko`）另外建一份 `src/lib/locale-labels.ts` 之類的靜態對照表，不用進 `messages/*.json`（這是 UI chrome 的固定資料，不隨語系翻譯）

### 3. 新元件架構：`UtilityMenu`

新建 `src/components/utility-menu.tsx`，取代 `site-header.tsx` 裡桌面版 + 手機版兩處的 `<LanguageSwitcher />`。

**資料驅動、可擴充設計**（因應「以後可能新增更多氣泡按鈕」）：

```ts
type BubbleConfig = {
  id: string
  icon: LucideIcon
  label: string          // aria-label
  onClick: () => void
  renderFlyout?: () => ReactNode   // 語言氣泡才用得到；沒有就是單純點擊按鈕
}
```

- 主圓形按鈕：**確定圖示暫時留白**（不放任何圖案），但按鈕結構要預留放圖片的空間（例如用 `next/image` 或簡單 `<img>`，先給一個空/透明的佔位、之後直接塞真實圖檔就好，不用改按鈕本身的排版邏輯），`aria-expanded` 控制開關狀態
- 氣泡清單用 `bubbles.map((bubble, i) => ...)` 渲染，每顆的進場動畫 `transition.delay = i * STAGGER_MS`（例如 `STAGGER_MS = 0.06`，上面那顆 `delay=0`、下面那顆 `delay=0.06`，數值兩顆差距肉眼可辨又不會慢到不像同一個動作，實作時可微調），達成「上面略快於下面、有波浪感」且未來加第三顆氣泡只要在陣列多加一筆設定就好，動畫邏輯不用碰
- 每顆氣泡的進場動畫本身：`initial={{ x: 16, opacity: 0, scale: 0.8 }}` → `animate={{ x: 0, opacity: 1, scale: 1 }}`（由右向左滑入 + 淡入 + 放大），對應「由右向左彈出」的描述
- 點擊外部（或按 `Escape`）收起整組氣泡選單（標準浮層互動慣例，避免選單一直卡著）

### 4. 氣泡 1：深色模式切換

- `onClick` 呼叫 `next-themes` 的 `useTheme()` 拿到的 `setTheme`，在 `light`/`dark` 之間切換（用 `resolvedTheme` 判斷目前實際套用的是哪個，因為 `theme` 本身可能是 `"system"`）
- 圖示依目前模式動態切換 `Sun`（目前是深色 → 點了會切淺色，顯示太陽圖示）/`Moon`（反之），這是深色模式切換鈕的常見慣例

### 5. 氣泡 2：語言選單

- `onClick` 切換一個 `langMenuOpen` 狀態，開啟時在氣泡 2「左側」（不是下方）用 Framer Motion 彈出一個選單面板，同樣是由右向左滑入的動畫語彙，跟主選單的氣泡動畫方向一致，視覺上統一
- 選單內容：8 個語言選項（沿用 `LanguageSwitcher` 現有的核心邏輯：`useLocale()` 抓目前語系、`router.replace(pathname, { locale })` 切換），每個選項顯示語言原生名稱（見上方 `locale-labels.ts`）
- 選到語言後：切換語系 + 收起語言選單 + 收起整組氣泡選單（選完就沒有理由繼續開著）
- 手機版（`Sheet` 選單內）**沿用同一套 `UtilityMenu` 互動邏輯**，跟桌面版一致，不做簡化版本

### 6. 顏色調整（已定案）

用 Python 實際做色彩空間換算（sRGB → OKLab → OKLCH，跟 `globals.css` 現有變數用的色彩模型一致，不是用簡化的 HSL 換算）+ WCAG 對比度計算，而不是憑肉眼估數值，確保醒目色當「文字色」使用時對比度合格（WCAG AA 一般文字門檻 4.5:1）。

#### (a) 淺色模式（`:root`）

| CSS 變數 | 用途 | Hex | OKLCH |
|---------|------|-----|-------|
| `--background` | 頁面底色 | `#FBF3DC`（使用者提供圖片色） | `oklch(0.964 0.031 91.0)` |
| `--card` / `--popover` / `--muted` / `--secondary` / `--sidebar` | 卡片、彈出選單、次要區塊——深度介於底色和醒目色之間（同色相、明度往下），使用者確認要跟著調（原本是純灰階） | `#EFE5C8` | `oklch(0.922 0.040 91.2)` |
| `--border` / `--input` / `--sidebar-border` | 邊框，比上面的卡片色再深一點點，維持可辨識的分隔線 | `#E3D7B5` | `oklch(0.880 0.047 90.9)` |
| `--highlight`（新變數） | 醒目色，用於文字與按鈕（見下方「四、7」套用範圍） | `#7E6725` | `oklch(0.523 0.089 89.5)` |

`--highlight` 對 `--background` 的對比度 **4.92:1**，通過 WCAG AA 一般文字門檻。

#### (b) 深色模式（`.dark`）

使用者指定底色 `#1A09B0`（深藍紫色，色相 268.9°，跟淺色模式的暖黃色調是完全不同方向——深色模式走冷色調，淺色模式走暖色調，這是刻意的日夜對比設計，非疏漏）：

| CSS 變數 | 用途 | Hex | OKLCH |
|---------|------|-----|-------|
| `--background` | 頁面底色（使用者指定） | `#1A09B0` | `oklch(0.355 0.229 268.9)` |
| `--card` / `--popover` / `--muted` / `--secondary` / `--sidebar` | 深度介於底色和醒目色之間（同色相、明度往上一點，在深色背景上要「稍微亮一點」才有卡片浮起的層次感，跟淺色模式的「往下」方向相反，符合深/淺兩種模式各自的層次邏輯） | `#3929C2` | `oklch(0.422 0.221 275.9)` |
| `--border` / `--input` / `--sidebar-border` | 邊框 | `#4F41C8` | `oklch(0.477 0.200 280.3)` |
| `--highlight` | 醒目色——深色背景上醒目色必須比背景**亮**才會顯眼（跟淺色模式的「比背景暗」方向相反），同色相往亮部與飽和度調整 | `#ACA5E9` | `oklch(0.753 0.097 288.6)` |

`--highlight` 對 `--background` 的對比度 **5.45:1**，通過 WCAG AA。

`--foreground`（一般內文文字色）等其餘變數維持現有邏輯不變，這次只動背景/卡片/邊框/新增的醒目色這幾個。

### 7. 醒目色套用範圍（已確認）

套用在以下 5 處（`text-highlight` class，透過 `@theme inline` 追加 `--color-highlight: var(--highlight)` 後就能直接當 Tailwind 顏色 class 用）：

1. **姓名「譚揚勳」**：`src/app/[locale]/page.tsx:34` 傳給 `IntroHero` 的 `title` prop，實際渲染在 `src/components/intro-hero.tsx:59`（`<h1>{title}</h1>`）。但 `messages/*.json` 的 `heroTitle` 目前是整句「哈囉，我是譚揚勳」，姓名只是句子裡的一部分——**不能整個 `<h1>` 套色**，只框姓名兩個字。做法：把 `heroTitle` 改用 `next-intl` 的 `t.rich()` 富文本格式，翻譯字串裡用一個自訂標籤包住姓名，例如 `"哈囉，我是<hl>譚揚勳</hl>"`，元件端 `t.rich('heroTitle', { hl: (chunks) => <span className="text-highlight">{chunks}</span> })`。這樣 8 種語言各自的翻譯字串只要把 `<hl>` 標籤包在對應語言的姓名部分即可，不受語序影響（例如英文版可能是 `"Hi, I'm <hl>Yang-Hsun Tan</hl>"`）
2. **暱稱「彈羊」**：同樣道理，`heroSubtitle`（目前整句「你也可以叫我彈羊」）也要改用 `t.rich()`，`<hl>` 包住暱稱部分
3. **專案標題**：`src/components/work-card.tsx:44`（`<CardTitle>{localize(work.title, locale)}</CardTitle>`，作品卡片列表）+ `src/app/[locale]/works/[slug]/page.tsx:60`（`<h1 className="text-3xl font-semibold tracking-tight">{localize(work.title, l)}</h1>`，作品詳情頁），兩處都是整個標題文字直接套色（跟姓名/暱稱不同，這裡是完整的標題本身，不用切分）
4. **各區塊標題**：`src/app/[locale]/page.tsx` 的三個 `<h2>`（第 47、52、57 行：「背景經歷」「代表作品」「聯絡我」）
5. **按鈕**：套用在按鈕本身（背景色），不是按鈕文字——`src/components/ui/button.tsx` 的 `buttonVariants` 預設 `variant: "default"` 目前是 `bg-primary text-primary-foreground`，改成使用 `--highlight` 當背景（`bg-highlight`），文字色需另外確認是否要建立對應的 `--highlight-foreground`（淺色模式醒目色偏暗，按鈕文字用淺色/白色系即可讀；深色模式醒目色偏亮，按鈕文字要用深色系），實作時一併定義

## 五、待確認事項（已全數回覆，保留紀錄）

1. ~~哪些文字要套用醒目色~~ → 已確認：譚揚勳、彈羊、專案標題、各區塊標題、按鈕（見「四、7」）
2. ~~淺色模式底色精準色碼~~ → 已確認：`#FBF3DC`
3. ~~卡片/彈出選單等元件底色要不要一起調整~~ → 已確認：要，深度介於底色和醒目色之間（見「四、6」）
4. ~~深色模式的醒目色~~ → 已確認：底色 `#1A09B0`，醒目色/卡片色由我一併計算定案（見「四、6(b)」）
5. ~~手機版要不要跟桌面版一樣的互動方式~~ → 已確認：一樣
6. ~~主圓形按鈕的圖示~~ → 已確認：暫時留白，但預留放圖片的空間

## 六、分階段實作步驟

- [ ] Phase A — 深色模式基礎設施：安裝 `next-themes`、新增 `theme-provider.tsx`、`layout.tsx` 接上 `ThemeProvider` + `suppressHydrationWarning`
- [ ] Phase B — 語言擴充：`routing.ts` 加 6 個 locale、新增 6 份 `messages/*.json` 翻譯（`heroTitle`/`heroSubtitle` 改用 `t.rich()` 格式，`<hl>` 包住姓名/暱稱部分）、新增 `locale-labels.ts` 語言原生名稱對照表
- [ ] Phase C — `UtilityMenu` 元件：主圓形按鈕（圖示留白、預留放圖片空間）+ 資料驅動的氣泡陣列 + 進場動畫（含波浪 stagger）+ 點外部關閉；桌面/手機共用同一元件
- [ ] Phase D — 氣泡 1（深色模式切換）接上 `useTheme()`
- [ ] Phase E — 氣泡 2（語言選單）：左側彈出面板 + 8 語言清單 + 切換邏輯（沿用 `LanguageSwitcher` 核心邏輯）
- [ ] Phase F — 替換 `site-header.tsx` 桌面版 + 手機版兩處掛載點，移除舊的 `language-switcher.tsx`（或保留其核心 hook 邏輯、UI 部分整併進新元件）
- [ ] Phase G — 顏色調整：`globals.css` 的 `:root`/`.dark` 依「四、6」表格套用 `--background`/`--card`/`--popover`/`--muted`/`--secondary`/`--sidebar`/`--border`/`--input` 全部新值，新增 `--highlight`（+ 深色模式需要的 `--highlight-foreground`／按鈕文字色），套用到「四、7」列出的 5 處
- [ ] Phase H — 驗證：`npm run build`/`npm run lint` 0 錯誤 0 警告；preview 工具實測氣泡彈出順序與延遲、深色模式切換即時生效且無 FOUC 閃爍、8 語言切換路由與內容正確、手機版 Sheet 內互動正常、`text-highlight` 5 處套用正確且對比度符合預期
