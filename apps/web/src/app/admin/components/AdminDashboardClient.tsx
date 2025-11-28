"use client";

import { getQueryClient } from "@/lib/getQueryClient";
import { DehydratedState, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { SurveyList } from "./SurveyList";

interface AdminDashboardClientProps {
  dehydratedState: DehydratedState;
}

export function AdminDashboardClient({ dehydratedState }: AdminDashboardClientProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">설문조사</h1>
            <p className="text-muted-foreground">내가 만든 설문조사 목록입니다.</p>
          </div>
          <SurveyList />
        </div>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
