import { getUserMissions } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { dehydrate } from "@tanstack/react-query";
import "./admin.css";
import { AdminHydrationBoundary } from "./components/AdminHydrationBoundary";
import { AdminLayout } from "./components/AdminLayout";
import { AdminQueryProvider } from "./components/AdminQueryProvider";
import { AdminGate } from "./components/guards/AdminGate";

export default async function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  const queryClient = getAdminQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: adminMissionQueryKeys.missions(),
    queryFn: ({ pageParam }) => {
      return getUserMissions({
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
