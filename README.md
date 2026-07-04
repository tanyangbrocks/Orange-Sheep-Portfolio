# Orange Sheep Portfolio

Personal portfolio site. Next.js (App Router) + TypeScript + Tailwind CSS, with:

- `next-intl` for i18n routing (`zh-TW` / `en`)
- `shadcn/ui` + `lucide-react` for UI components
- `Velite` for a type-safe, schema-validated content layer (`content/works/`)

See [docs/plan-portfolio-website.md](docs/plan-portfolio-website.md) for the full implementation plan.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — requests are redirected to the default locale (`/zh-TW`).

## Content

Each work entry is a YAML file in `content/works/`, validated against the schema in `velite.config.ts`.
Categories (and which fields each one uses) are configured in `content/categories.ts`.

## Deploy

Deploy on Vercel: https://vercel.com/new
