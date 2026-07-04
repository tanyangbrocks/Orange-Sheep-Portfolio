export type Locale = 'zh-TW' | 'en'

export type CategoryId = 'project' | 'designAsset' | 'business' | 'creative'

export type CategoryConfig = {
  id: CategoryId
  name: Record<Locale, string>
  /** Known subcategories for this category (informational, for grouping/filtering UI). New ones can be added freely without touching this list. */
  subcategories?: { id: string; name: Record<Locale, string> }[]
  fields: {
    preview: boolean
    downloadUrl: boolean
  }
}

export const categories: CategoryConfig[] = [
  {
    id: 'project',
    name: { 'zh-TW': '專案', en: 'Projects' },
    subcategories: [
      { id: 'tool', name: { 'zh-TW': '工具', en: 'Tools' } },
      { id: 'game', name: { 'zh-TW': '遊戲', en: 'Games' } }
    ],
    fields: { preview: true, downloadUrl: true }
  },
  {
    id: 'designAsset',
    name: { 'zh-TW': '設計資產', en: 'Design Assets' },
    fields: { preview: true, downloadUrl: true }
  },
  {
    id: 'business',
    name: { 'zh-TW': '商業領域', en: 'Business' },
    fields: { preview: true, downloadUrl: true }
  },
  {
    id: 'creative',
    name: { 'zh-TW': '創作領域', en: 'Creative' },
    fields: { preview: true, downloadUrl: false }
  }
]

export function getCategory(id: string) {
  return categories.find((c) => c.id === id)
}
