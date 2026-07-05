/**
 * Site-wide asset registry (favicon, OG image, and future logo/avatar/résumé
 * files). Anything that isn't per-work content lives here — code should
 * import this constant instead of writing a path literal in a component or
 * `layout.tsx`, so swapping an asset later means changing one line here
 * instead of hunting for every place it's referenced.
 */
export const siteAssets = {
  favicon: '/favicon.ico',
  ogImage: '/og-default.png' // not created yet — add the file when Phase 2 needs an OG image
} as const
