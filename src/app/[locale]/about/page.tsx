import { SiteHeader } from '@/components/site-header'

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="text-muted-foreground">Placeholder — content to be added in a later phase.</p>
      </main>
    </div>
  )
}
