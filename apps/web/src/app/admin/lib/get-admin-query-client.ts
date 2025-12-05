import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";

function makeAdminQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          if (
            error instanceof Error &&
            "status" in error &&
            (error as { status?: number }).status === 404
          )
            return false;
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
      dehydrate: {
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserAdminQueryClient: QueryClient | undefined = undefined;

export function getAdminQueryClient() {
  if (isServer) {
    return makeAdminQueryClient();
  }
  if (!browserAdminQueryClient) browserAdminQueryClient = makeAdminQueryClient();
  return browserAdminQueryClient;
}
