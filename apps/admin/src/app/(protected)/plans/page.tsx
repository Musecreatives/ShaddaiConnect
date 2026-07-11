import { PlansClient } from '@/components/PlansClient';
import { getPlansServer } from '@/lib/server-api';

export default async function PlansPage() {
  const plans = await getPlansServer();
  return <PlansClient initialPlans={plans} />;
}
