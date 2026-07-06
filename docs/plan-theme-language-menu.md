# 右上角圓形選單（深色模式 + 多語系）— 實作計畫

最後更新：2026-07-06

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

- 主圓形按鈕：`aria-expanded` 控制開關狀態，圖示可以固定用一個中性符號（例如三個點，或直接沿用目前 `Sun`/`Globe` 疊加的概念——待確認，見下方待確認事項）
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

### 6. 顏色調整

#### (a) 淺色模式底色

使用者提供的參考圖片是一片暖色調的米白/奶油色（偏黃的淺色，不是純白）。**初步估算**約為 `#FBF3DC` 附近（換算 oklch 大約 `oklch(0.97 0.02 95)`），但這只是目視估算——如果要精準對色，麻煩提供圖片的確切色碼，或是把圖片存成檔案讓我用程式直接讀像素值，避免憑肉眼誤差。

只改 `--background` 這一個變數的話，會變成「米白色的頁面底色，但卡片(`--card`)/彈出選單(`--popover`)/次要區塊(`--muted`/`--secondary`)還是純灰階的白」，兩者放在一起可能會看起來不協調（暖色背景襯著冷白色卡片）。**建議**同時把這幾個關聚變數也往同一個暖色調微調（同色相、更淺或更接近底色的明度），讓整個淺色主題看起來是一致的暖色調而不是「背景改了，其他元件忘了改」——但這是額外建議，如果使用者只想單純換 `--background` 這一格、其他保持現狀也可以，请在下方確認。

深色模式（`.dark` 那組變數）維持現有的中性灰階，不受這次淺色底色調整影響。

#### (b) 醒目色（highlight）

新增一個 CSS 變數 `--highlight`（透過 `@theme inline` 追加 `--color-highlight: var(--highlight)`，就能像現有的 `text-muted-foreground` 一樣直接用 `text-highlight` 這個 Tailwind class），比背景色深、但同色系——初步估算是一個偏暗的暖金/琥珀色，大約 `#9C7A2E` 附近（`oklch(0.55 0.09 90)` 上下），實際數值會依最終底色精準值再微調，確保「同色系、有層次但不突兀」。

深色模式下是否也要一個對應的醒目色（現有底色是純灰階，需要另外決定一個深色模式適用、對比度足夠的醒目色），還是這次只處理淺色模式——見下方待確認事項。

## 五、待確認事項

1. **哪些文字要套用醒目色？** 目前不清楚使用者想套用在哪些文字上（例如：首頁三格經歷數字「X 年開發經驗」的數字本身？姓名/暱稱「彈羊」？區塊標題？導覽列作用中項目？）。麻烦確認具體範圍，或是我先挑幾處代表性的位置做提案，實作時再依回饋調整。
2. **淺色模式底色精準色碼**：目前是目視估算 `#FBF3DC` 附近，如果有明確色碼（例如設計稿裡的色票、或圖片另存成檔案讓我讀像素）會更準確。
3. **除了 `--background` 之外，卡片/彈出選單/次要區塊等元件底色要不要一起微調成同色系的暖色調？** （見「四、6(a)」的說明）
4. **深色模式的醒目色**：這次要不要也定義一個深色模式版本的醒目色，還是先只處理淺色模式（深色模式維持現有全灰階配色）？
5. **手機版（`Sheet` 選單裡）的圓形按鈕彈氣泡要跟桌面版完全一樣的互動方式嗎？** 手機選單本身已經是一個由右滑出的側邊欄、垂直排列的清單，在裡面再放一顆「點擊後往下彈出氣泡」的按鈕，空間/動線上可能會比桌面版侷促。預設方案是**沿用同一個 `UtilityMenu` 元件**（維持風格一致、邏輯统一好維護），但如果使用者覺得手機版該用更簡化的版型（例如直接展開成一列，不用氣泡動畫），請告知。
6. **主圓形按鈕的圖示**：目前沒有指定按鈕本身（尚未點擊時）要顯示什麼圖示——是固定圖案（例如三個點、或一個通用的「設定」齒輪），還是要動態反映目前狀態（例如顯示目前語言的代碼、或目前深色/淺色模式的圖示）？預設提案是用一個中性、不隨狀態變化的圖示（例如 `Settings2` 或簡單的三點 `MoreVertical`），避免跟裡面兩顆氣泡各自的圖示語意重複混淆。

## 六、分階段實作步驟

- [ ] Phase A — 深色模式基礎設施：安裝 `next-themes`、新增 `theme-provider.tsx`、`layout.tsx` 接上 `ThemeProvider` + `suppressHydrationWarning`
- [ ] Phase B — 語言擴充：`routing.ts` 加 6 個 locale、新增 6 份 `messages/*.json` 翻譯、新增 `locale-labels.ts` 語言原生名稱對照表
- [ ] Phase C — `UtilityMenu` 元件：主圓形按鈕 + 資料驅動的氣泡陣列 + 進場動畫（含波浪 stagger）+ 點外部關閉
- [ ] Phase D — 氣泡 1（深色模式切換）接上 `useTheme()`
- [ ] Phase E — 氣泡 2（語言選單）：左側彈出面板 + 8 語言清單 + 切換邏輯（沿用 `LanguageSwitcher` 核心邏輯）
- [ ] Phase F — 替換 `site-header.tsx` 桌面版 + 手機版兩處掛載點，移除舊的 `language-switcher.tsx`（或保留其核心 hook 邏輯、UI 部分整併進新元件）
- [ ] Phase G — 顏色調整：`globals.css` 的 `--background`（+ 視「五、3」的回覆決定是否連動調整其他元件底色）、新增 `--highlight` 變數並套用到「五、1」確認的文字範圍
- [ ] Phase H — 驗證：`npm run build`/`npm run lint` 0 錯誤 0 警告；preview 工具實測氣泡彈出順序與延遲、深色模式切換即時生效且無 FOUC 閃爍、8 語言切換路由與內容正確、手機版 Sheet 內互動正常
