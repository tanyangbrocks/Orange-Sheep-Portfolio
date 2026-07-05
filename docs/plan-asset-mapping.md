# 資產映射機制 — 實作計畫

最後更新：2026-07-05

## 一、目標

目前程式碼/內容裡凡是要顯示一張圖，路徑都是「寫死的字串」——要嘛是作者在 YAML 裡手打一段完整路徑，要嘛（如果之後新增站台層級素材，例如 Logo、社群分享圖）就是直接寫死在元件或 `layout.tsx` 裡。這樣以後想換圖，得先想起來/找到「這個東西是在哪一行被引用」。

目標是加一層**資產映射層**：程式碼只認一個「邏輯 ID/欄位」，實際檔案在哪、要不要有預設圖，都集中在少數幾個地方決定。以後要換素材，只要換檔案本身或改映射表的一行，不用去程式碼裡到處找引用點。

參考依據：`C:\SkillCreatorUE5\CLAUDE.md`「替換/新增實體物品 3D Mesh」一節描述的 `APhysicalItemActor::Init()` 三層查找機制：
1. **明確覆寫**（`FItemData::MeshPath`，資料表手動填的精確路徑）
2. **慣例路徑**（`/Game/Items/SM_{EItemId 值名稱}`，沒填第 1 層時自動去找這個規律命名的檔案）
3. **通用預設值**（Engine BasicShape，前兩層都沒有時保底顯示，不會空白/壞掉）

Portfolio 是純前端靜態網站，沒有 UE5 那樣的 Actor/Registry 執行期查找，所以這裡把同樣的三層邏輯搬到 **Velite build time**（Node 環境，build 時就把最終路徑算好、寫進型別安全的資料裡，元件端完全不用知道有這層邏輯存在）。比 UE5 版本簡單很多：不需要 GameplayTag、不需要處理背景執行緒 thread-safety，就是一個 build-time 的路徑決議函式。

## 二、現況調查

| 資產類型 | 目前狀況 | 問題 |
|---------|---------|------|
| 作品預覽圖 `content/works/*.yml` 的 `previewImages` | `velite.config.ts` 定義成 `s.array(s.string()).optional()`，純字串陣列，作者要手打完整路徑（如 `/works/xxx.png`） | 沒有 fallback：路徑打錯、圖片還沒準備好時，`next/image` 直接壞掉或整塊預覽區塊消失（見 `work-card.tsx` 的 `{preview && (...)}`，`example-project-tool.yml` 目前完全沒填 `previewImages`，所以卡片沒有任何預覽圖） |
| `public/works/placeholder.svg` | 檔案已經放好 | **孤兒檔案**：目前沒有任何程式碼實際引用它，等於白放 |
| Favicon | `src/app/favicon.ico`，Next.js 預設慣例路徑 | 沒有映射層，但目前也沒有替換需求，風險低 |
| 社群分享圖（OG image）、未來的 Logo/大頭貼/履歷下載檔 | 目前**完全不存在**，尚未有任何程式碼引用 | 一旦之後要加，若沒有映射層，很容易直接寫死在 `layout.tsx`/`generateMetadata` 裡 |

## 三、設計方案

### 1. 作品預覽圖：三層查找（對應 UE5 的 MeshPath 機制）

新增一個 build-time 查找函式，在 Velite 的 `works` collection schema 用 `.transform()` 呼叫：

1. **Tier 1 明確覆寫**：YAML 有填 `previewImages` → 直接採用（等同 UE5 `MeshPath` 手動指定精確路徑；適合需要多張圖 gallery 的情況，慣例路徑機制只能猜到「一張」封面圖，猜不到一整組 gallery）
2. **Tier 2 慣例路徑**：YAML 沒填 → 依序嘗試 `public/works/{slug}.png`、`.jpg`、`.jpeg`、`.webp`、`.svg`（用 Node `fs.existsSync` 檢查，找到第一個存在的就用），等同 UE5 `/Game/Items/SM_{EnumName}` 慣例路徑
3. **Tier 3 通用預設值**：前兩層都沒有 → 用現有的 `public/works/placeholder.svg`，等同 UE5 Engine BasicShape 保底顯示

查找函式獨立寫成 `content/works/resolve-preview-images.ts`，`velite.config.ts` 的 schema 改成：

```ts
previewImages: s.array(s.string()).optional().transform((val, { meta }) =>
  resolvePreviewImages(val, meta.path /* 從檔名推 slug，或直接讀 data.slug */)
)
```

（實際簽名待實作時依 Velite API 微調，這裡先定調邏輯，不鎖死寫法。）

**行為變更提醒**：這會讓「目前完全沒有預覽圖的作品」（如 `example-project-tool`）從「卡片不顯示圖片區塊」變成「卡片顯示 placeholder.svg」。這是刻意的（呼應 UE5 保底顯示的精神：永遠有東西可以看，而不是空白），但列出來讓你確認這個行為變更是想要的。

### 2. 站台層級資產：集中設定檔（對應 UE5 的 ItemRegistry「一個地方查所有東西」）

新增 `src/lib/site-assets.ts`，先只放目前**已經有實際用途**的兩筆，避免預先加一堆用不到的欄位：

```ts
export const siteAssets = {
  favicon: '/favicon.ico',
  ogImage: '/og-default.png' // 目前不存在，等 Phase 2 有 OG 圖需求時再放檔案
} as const
```

之後任何地方要引用「網站層級」的固定資產（Logo、大頭貼、履歷 PDF……），一律在這個檔案加一筆、程式碼 import 這個常數，不要直接寫死路徑字串。要換素材時，只需要換檔案或改這裡的一行。

### 3.（可選，Phase 2 之後再做）內容一致性檢查腳本

比照 UE5 `generate_placeholders.py` 的精神，寫一個小型 Node 腳本掃 `content/works/*.yml`，列出「目前正在吃 Tier 3 placeholder 的作品清單」，方便之後管理內容時知道哪幾筆還沒放圖。**非必要**，先跳過，等作品數量變多、placeholder 開始不好用肉眼盯的時候再補。

## 四、實作步驟（暫不執行，待確認計畫後再動手）

1. 寫 `content/works/resolve-preview-images.ts`（三層查找函式），手動驗證三種情境：YAML 有填 / 慣例路徑存在但沒填 YAML / 兩者都沒有
2. 修改 `velite.config.ts`，`works.previewImages` 改用上述函式做 `.transform()`
3. 新增 `src/lib/site-assets.ts`（先放 `favicon`、`ogImage` 兩筆）
4. 找目前唯一引用 favicon 的地方（Next.js 慣例路徑本身不需要改，此步驟視情況可能是「暫不需要改動任何檔案，`site-assets.ts` 先建檔占位」）
5. 跑 `npm run build` / `npm run lint`，確認 Velite + Next.js + TypeScript 都過，且找一筆「無 previewImages」的作品實際看畫面確認吃到 placeholder
6. 更新 `實作進度.md`

## 五、影響範圍 / 風險

- **不改變**任何現有元件的 props 型別介面：`WorkCard`、`WorksFilter` 拿到的 `previewImages` 陣列格式完全不變，只是內容從「作者手打的字串，可能是 undefined」變成「build time 保證至少有一個字串（explicit 或 convention 或 placeholder）」
- **不影響**已上線的 Vercel 部署行為：純 build-time 邏輯，不新增任何 runtime 依賴或 API
- 唯一需要你確認的行為變更：第三節提到的「無圖作品從空白變成顯示 placeholder.svg」

## 六、待決定事項（需要你回覆）

1. 第三節的行為變更（無圖 → 顯示 placeholder）你是否接受？還是希望維持「沒圖就不顯示預覽區塊」的現況，placeholder 機制只在「Tier 2 慣例路徑」情境生效？
2. Tier 2 慣例路徑的檔名規則 `public/works/{slug}.{ext}` 是否符合你的預期？（另一個選項是每個作品一個資料夾 `public/works/{slug}/cover.{ext}`，之後如果同一個作品的其他素材——例如影片縮圖——也想歸在同一層，資料夾式會更好擴充，但目前用不到就先簡單版）
3. 第三節的「內容一致性檢查腳本」要不要現在就一起排進 Phase 1，還是真的等以後需要再說？
