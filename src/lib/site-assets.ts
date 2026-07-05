/**
 * Site-wide asset registry (favicon, OG image, and future logo/avatar/résumé
 * files). Anything that isn't per-work content lives here — code should
 * import this constant instead of writing a path literal in a component or
 * `layout.tsx`, so swapping an asset later means changing one line here
 * instead of hunting for every place it's referenced.
 */
export const siteAssets = {
  // Not referenced by code — Next.js's file convention (src/app/icon.png)
  // picks this up and generates the <link rel="icon"> tags automatically.
  // Listed here so this stays the one place documenting where it lives.
  favicon: 'src/app/icon.png',
  ogImage: '/og-default.png', // not created yet — add the file when Phase 2 needs an OG image
  // Intro section photo carousel (src/components/photo-carousel.tsx caps this
  // at 5 regardless of how many paths are listed). Empty for now — add paths
  // under public/ once real photos are ready, e.g. '/intro/photo-1.jpg'.
  introPhotos: [] as string[]
} as const
