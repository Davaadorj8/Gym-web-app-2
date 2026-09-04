'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/orchestration';

export default function DashboardPage() {
  const router = useRouter();
  const { activeTab } = useDashboard();

  useEffect(() => {
    router.replace(`/dashboard/${activeTab || 'directory'}`);
  }, [router, activeTab]);

  return null;
}
