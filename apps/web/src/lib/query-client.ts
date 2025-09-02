import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          )
            return false;
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  });

export const queryClient = createQueryClient();
