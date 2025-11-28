import { getUserSurveys } from "@/actions/survey/read";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import "./admin.css";
import { AdminHydrationBoundary } from "./components/AdminHydrationBoundary";
import { AdminLayout } from "./components/AdminLayout";
import { AdminQueryProvider } from "./components/AdminQueryProvider";
import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit: 10,
      });
    },
    initialPageParam: "",
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="admin-root fixed inset-0 overflow-auto">
      <AdminGate>
        <AdminQueryProvider>
          <AdminHydrationBoundary state={dehydratedState}>
            <AdminLayout>{children}</AdminLayout>
          </AdminHydrationBoundary>
        </AdminQueryProvider>
      </AdminGate>
    </div>
  );
}
