import { MediaClient } from '@/components/MediaClient';
import { getMediaServer } from '@/lib/server-api';

export default async function MediaPage() {
  const media = await getMediaServer();
  return <MediaClient initialMedia={media} />;
}
