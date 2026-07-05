import { redirect } from 'next/navigation'

type Props = { params: Promise<{ locale: string }> }

// The works list now lives inline on the home page (#works section).
// This route only exists so old/external links to /works keep working.
export default async function WorksPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}#works`)
}
