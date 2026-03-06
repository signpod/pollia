import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";
import { cache } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR에서는 클라이언트에서 즉시 리페치를 방지하기 위해
        // 0보다 큰 기본 staleTime을 설정
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
        // pending 쿼리도 dehydration에 포함
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

// 서버: React.cache로 같은 요청 내에서 QueryClient를 공유
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return getServerQueryClient();
  }
  // 브라우저: 이미 있지 않은 경우에만 새로운 쿼리 클라이언트 생성
  // React가 초기 렌더에서 suspend하는 경우 새로운 클라이언트를 재생성하지 않도록 함
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
