import { notFound } from 'next/navigation';
import { PostEditorClient } from '@/components/PostEditorClient';
import { getCategoriesServer, getPostServer } from '@/lib/server-api';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [post, categories] = await Promise.all([
    getPostServer(postId).catch(() => null),
    getCategoriesServer(),
  ]);
  if (!post) notFound();

  return <PostEditorClient post={post} categories={categories} />;
}
