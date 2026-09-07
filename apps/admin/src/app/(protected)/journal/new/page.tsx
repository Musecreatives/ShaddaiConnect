import { PostEditorClient } from '@/components/PostEditorClient';
import { getCategoriesServer } from '@/lib/server-api';

export default async function NewPostPage() {
  const categories = await getCategoriesServer();
  return <PostEditorClient categories={categories} />;
}
