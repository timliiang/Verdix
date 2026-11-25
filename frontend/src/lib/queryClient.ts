import { QueryClient } from '@tanstack/react-query';
import { isRetryable } from '../api/apiError';

// One QueryClient for the app: TanStack Query's cache of server data, keyed by query keys
// (lib/queryKeys.ts). Components read with useQuery and change data with useMutation; after a
// change, invalidating a key marks those reads stale and refetches the ones on screen.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Reads are idempotent, so repeating one is safe: up to 2 retries for network and 5xx
            // failures, with TanStack's exponential backoff (1s, then 2s). A 404 or 403 is final.
            retry: (failureCount, error) => failureCount < 2 && isRetryable(error),
            // Data counts as fresh for a minute: revisiting a film within that window renders from
            // cache with no request. After it, the cached copy still renders at once while a
            // background refetch runs ("stale-while-revalidate").
            staleTime: 60_000,
            // Off: switching tabs back to a film would refetch TMDB data that changes hourly at most.
            // Reviews opt back in where freshness matters (useMovieReviews).
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Never retry writes automatically. A POST that timed out may still have been saved;
            // sending it again would create a duplicate review. The user decides whether to retry.
            retry: false,
        },
    },
});
