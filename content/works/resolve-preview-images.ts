import fs from 'node:fs'
import path from 'node:path'

const CONVENTION_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg']
const PLACEHOLDER = '/works/placeholder.svg'

/**
 * Three-tier lookup for a work's preview images, mirroring the UE5 project's
 * ItemRegistry mesh-path pattern (explicit override → convention path → generic fallback):
 *   1. Explicit: the YAML's own `previewImages` list, if non-empty.
 *   2. Convention: `public/works/{slug}.{png,jpg,jpeg,webp,svg}`, first match wins.
 *   3. Fallback: the shared placeholder, so a work is never left with no preview at all.
 */
export function resolvePreviewImages(explicit: string[] | undefined, slug: string): string[] {
  if (explicit && explicit.length > 0) return explicit

  for (const ext of CONVENTION_EXTENSIONS) {
    const relative = `/works/${slug}.${ext}`
    const absolute = path.join(process.cwd(), 'public', relative)
    if (fs.existsSync(absolute)) return [relative]
  }

  return [PLACEHOLDER]
}
