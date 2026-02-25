import { getCurrentUser } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { AccountEditContent } from "./AccountEditContent";

export default async function AccountEditPage() {
  const queryClient = getQueryClient();

  const userData = await queryClient.fetchQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => getCurrentUser(),
  });
  if (!userData.data) {
    redirect("/login");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountEditContent userName={userData.data!.name} />
    </HydrationBoundary>
  );
}
