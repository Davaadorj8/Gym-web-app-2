import { QueryClient } from '@tanstack/react-query';

// Default cache tuning for the dashboard's tenant/location-scoped reads: data is
// considered fresh for 30s (skip refetch on remount/refocus within that window) and is
// kept in the cache for 5 minutes after becoming unused (e.g. switching locations and
// back) so it can be shown instantly while a background refetch runs.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// Always create a fresh client on the server (per request), but reuse a single
// client in the browser so the cache survives client-side navigations.
export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
