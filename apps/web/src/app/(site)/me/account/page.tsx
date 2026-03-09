import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountClient />
    </HydrationBoundary>
  );
}
