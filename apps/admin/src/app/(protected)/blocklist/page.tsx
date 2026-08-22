import { BlocklistClient } from '@/components/BlocklistClient';
import { getBlockedMacsServer } from '@/lib/server-api';

export default async function BlocklistPage() {
  const blocked = await getBlockedMacsServer();
  return <BlocklistClient initialBlocked={blocked} />;
}
