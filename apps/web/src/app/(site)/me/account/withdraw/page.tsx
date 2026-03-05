import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { WithdrawContent } from "./WithdrawContent";

export default async function WithdrawPage() {
  const queryClient = getQueryClient();

  const userData = await queryClient.fetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WithdrawContent userName={userData.data.name} />
    </HydrationBoundary>
  );
}
