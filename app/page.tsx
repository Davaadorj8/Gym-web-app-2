'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user) {
      router.replace('/dashboard/directory');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-muted-foreground text-sm font-mono animate-pulse">
        Loading Arche.fitness Console...
      </div>
    </div>
  );
}
