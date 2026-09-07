import { JournalClient } from '@/components/JournalClient';
import { getPostsServer } from '@/lib/server-api';

export default async function JournalPage() {
  const posts = await getPostsServer();
  return <JournalClient initialPosts={posts} />;
}
