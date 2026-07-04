import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.argv.includes("dev");

// Run Velite before Next.js starts so `#velite` is always up to date;
// watches content files in dev, single build in production.
// The assigned value is a pending Promise, not a string — this only works
// because we bypass the typed `process.env` accessor to trigger the side effect once.
(process.env as Record<string, unknown>).VELITE_STARTED ??= (async () => {
  const { build } = await import("velite");
  await build({ watch: isDev, clean: !isDev });
  return "true";
})();

const nextConfig: NextConfig = {
  /* config options here */
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
