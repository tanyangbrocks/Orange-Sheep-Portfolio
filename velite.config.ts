import { defineConfig, defineCollection, s } from 'velite'
import { resolvePreviewImages } from './content/works/resolve-preview-images'

const localizedText = s.object({
  'zh-TW': s.string(),
  en: s.string()
})

const link = s.object({
  label: s.string(),
  url: s.string()
})

const works = defineCollection({
  name: 'Work',
  pattern: 'works/**/*.yml',
  schema: s
    .object({
      slug: s.slug('works'),
      category: s.string(),
      subcategory: s.string().optional(),
      title: localizedText,
      description: localizedText,
      previewImages: s
        .array(s.string())
        .optional()
        .transform((value, ctx) => resolvePreviewImages(value, ctx.meta.stem ?? '')),
      links: s.array(link).optional(),
      downloadUrl: s.string().optional(),
      tags: s.array(s.string()).optional(),
      date: s.isodate(),
      featured: s.boolean().optional()
    })
})

const experiences = defineCollection({
  name: 'Experience',
  pattern: 'experiences/**/*.yml',
  schema: s
    .object({
      slug: s.slug('experiences'),
      role: localizedText,
      organization: s.string(),
      period: localizedText,
      description: localizedText,
      image: s.string().optional(),
      startDate: s.isodate()
    })
})

export default defineConfig({
  root: 'content',
  collections: { works, experiences },
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  }
})
