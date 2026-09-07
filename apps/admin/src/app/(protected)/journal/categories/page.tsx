import { CategoriesClient } from '@/components/CategoriesClient';
import { getCategoriesServer } from '@/lib/server-api';

export default async function CategoriesPage() {
  const categories = await getCategoriesServer();
  return <CategoriesClient initialCategories={categories} />;
}
