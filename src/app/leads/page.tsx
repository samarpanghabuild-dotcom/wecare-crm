import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LeadsClient } from './LeadsClient';

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <LeadsClient />;
}
