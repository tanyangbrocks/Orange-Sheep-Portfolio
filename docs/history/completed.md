# Completed Milestones History

Auto-archived from C:\Portfolio\實作進度.md by docs/archive-done.ps1.

| 功能 | 關鍵檔案 | 摘要 |
|------|---------|------|
| Phase 1：專案骨架 + 多語系底座 | `next.config.ts`、`velite.config.ts`、`content/categories.ts`、`src/i18n/*`、`src/app/[locale]/layout.tsx` | Next.js 16（App Router）+ TypeScript + Tailwind v4 scaffold；`next-intl` 雙語 routing（`/zh-TW`、`/en`）+ 語言切換器；`shadcn/ui`（Base UI 版本）+ `lucide-react`；`Velite` 內容層（`WorkEntry` schema，四大分類各建 1 筆假資料驗證欄位差異，例如創作領域無下載點）；`next/font`。連接 GitHub [`tanyangbrocks/Orange-Sheep-Portfolio`](https://github.com/tanyangbrocks/Orange-Sheep-Portfolio.git)。 |
| Phase 2-3：分類篩選 UI + 作品詳情頁 + 動態特效 | `src/components/works-filter.tsx`、`src/app/[locale]/works/[slug]/page.tsx`、`src/components/work-card.tsx`、`src/app/[locale]/template.tsx`、`src/app/[locale]/layout.tsx` | 作品列表頁加上分類/子分類篩選（shadcn Tabs + Badge，client-side 篩選）；新增作品詳情頁（gallery、雙語敘述、外部連結按鈕、下載按鈕依 `downloadUrl` 是否存在顯示，含 `generateStaticParams`/`generateMetadata`）；Framer Motion 卡片 hover + 進場動畫 + 路由層級頁面轉場（`template.tsx`，比 `AnimatePresence` 手動處理簡單）；`ReactLenis` 平滑捲動；Vercel Analytics + Speed Insights 安裝（部署前是安全的 no-op）；`next experimental-analyze` 確認 bundle 體積合理（client chunks 共約 1.1MB 未壓縮，無異常大檔案；`@next/bundle-analyzer` 不支援 Turbopack build，已改用 Next 內建方案）。 |
