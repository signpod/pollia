"use client";

import { getUserMissions } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { MeFooter, MyContentTabs, ProfileSection } from "./components";

export function MePageContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);

    queryClient.prefetchInfiniteQuery({
      queryKey: missionQueryKeys.userMissions(),
      queryFn: () => getUserMissions({ limit: 4 }),
      initialPageParam: undefined as string | undefined,
    });
  }, [queryClient]);

  return (
    <div className="flex flex-col gap-15 py-5">
      <div className="flex flex-col gap-10">
        <ProfileSection />
        <MyContentTabs />
      </div>
      {/* <div className="h-1 w-full bg-zinc-100" /> */}
      {/* <RecommendedContents userName={user.name} /> */}
      <div className="h-1 w-full bg-zinc-100" />
      <MeFooter />
    </div>
  );
}
