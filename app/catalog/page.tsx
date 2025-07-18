import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Catalog'
};

// This page needs dynamic rendering for i18n
export const dynamic = 'force-dynamic';

export default function CatalogPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Course Catalog</h1>
      <p className="text-muted-foreground">Browse all yoga courses. (Coming soon)</p>
    </div>
  );
}
