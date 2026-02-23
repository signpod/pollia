import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AccountContent } from "./AccountContent";

export default async function AccountPage() {
  const queryClient = getQueryClient();

  const userData = await queryClient.fetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountContent user={userData.data} />
    </HydrationBoundary>
  );
}
