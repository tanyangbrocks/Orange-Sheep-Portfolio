// Lists which works are currently falling back to the generic placeholder
// preview image (Tier 3 of content/works/resolve-preview-images.ts), so it's
// easy to see what still needs real art. Mirrors the spirit of the UE5
// project's generate_placeholders.py — a manual, run-when-you-want-to-check
// content-completeness tool, not part of the build itself.
//
// Usage: npm run build   (so .velite/works.json is fresh)
//        node scripts/check-placeholder-previews.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PLACEHOLDER = '/works/placeholder.svg'
const root = path.dirname(fileURLToPath(import.meta.url))
const worksJsonPath = path.join(root, '..', '.velite', 'works.json')

let works
try {
  works = JSON.parse(readFileSync(worksJsonPath, 'utf8'))
} catch {
  console.error(`Could not read ${worksJsonPath}. Run "npm run build" first so Velite output is up to date.`)
  process.exit(1)
}

const usingPlaceholder = works.filter((w) => w.previewImages.length === 1 && w.previewImages[0] === PLACEHOLDER)

if (usingPlaceholder.length === 0) {
  console.log('All works have a real preview image (explicit or convention path).')
} else {
  console.log(`${usingPlaceholder.length} work(s) still using the placeholder preview:`)
  for (const w of usingPlaceholder) console.log(` - ${w.slug}`)
}
