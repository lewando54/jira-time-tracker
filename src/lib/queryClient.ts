import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 or 404
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status
          if (status === 401 || status === 404) return false
        }
        return failureCount < 2
      },
    },
  },
})
