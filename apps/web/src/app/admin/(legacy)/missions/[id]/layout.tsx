import { getMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface AdminMissionLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function AdminMissionLayout({ children, params }: AdminMissionLayoutProps) {
  const { id: missionId } = await params;
  const queryClient = getAdminQueryClient();

  await queryClient.prefetchQuery({
    queryKey: adminMissionQueryKeys.detail(missionId),
    queryFn: () => getMission(missionId),
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
