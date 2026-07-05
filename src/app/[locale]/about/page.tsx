import { redirect } from 'next/navigation'

type Props = { params: Promise<{ locale: string }> }

// About content now lives inline on the home page (#about section).
// This route only exists so old/external links to /about keep working.
export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}#about`)
}
