import HomePage from '../page';

export const dynamic = 'force-dynamic';

// Generate static params for all supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es-MX' }
  ];
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: PageProps) {
  const resolvedParams = await params;
  return <HomePage params={resolvedParams} />;
} 