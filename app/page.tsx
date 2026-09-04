'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/orchestration';
import LoginScreen from '@/components/auth/LoginScreen';

export default function App() {
  const { isAuthenticated, isLoading, statusMessage, setStatusMessage, login, activeTab } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/dashboard/${activeTab || 'directory'}`);
    }
  }, [isAuthenticated, activeTab, router]);

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={login}
        isLoading={isLoading}
        statusMessage={statusMessage}
        onClearStatus={() => setStatusMessage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-muted-foreground text-sm font-mono animate-pulse">
        Loading Arche.fitness Console...
      </div>
    </div>
  );
}
