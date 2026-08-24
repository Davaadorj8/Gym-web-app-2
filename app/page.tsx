'use client';

import React from 'react';
import { DashboardProvider, useDashboard } from '@/lib/orchestration';
import LoginScreen from '@/components/auth/LoginScreen';
import DashboardShell from '@/components/dashboard/DashboardShell';

function AppContent() {
  const { isAuthenticated, isLoading, statusMessage, setStatusMessage, login } = useDashboard();

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

  return <DashboardShell />;
}

export default function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}
