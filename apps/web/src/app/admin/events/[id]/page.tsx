import { getEventWithMissions } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { dehydrate } from "@tanstack/react-query";
import { AdminHydrationBoundary } from "../../components/AdminHydrationBoundary";
import { EventDetailContent } from "./components/EventDetailContent";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const queryClient = getAdminQueryClient();

  await queryClient.prefetchQuery({
    queryKey: adminEventQueryKeys.detailWithMissions(id),
    queryFn: () => getEventWithMissions(id),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <AdminHydrationBoundary state={dehydratedState}>
      <EventDetailContent eventId={id} />
    </AdminHydrationBoundary>
  );
}
