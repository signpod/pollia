"use client";

import { ROUTES } from "@/constants/routes";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import { Tab, Typo } from "@repo/ui/components";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyResponses } from "../hooks/useMyResponses";
import { type UseRewardsReturn, useRewards } from "../hooks/useRewards";
import { EmptyState } from "./EmptyState";
import { InProgressGrid } from "./InProgressGrid";
import { MeLikedMissionCard } from "./MeLikedMissionCard";
import { MeProjectCard } from "./MeProjectCard";
import { RewardCard } from "./RewardCard";
import { SectionHeader } from "./SectionHeader";

const MAX_PREVIEW = 4;
const MAX_REWARDS_PREVIEW = 3;

type RewardItem = NonNullable<UseRewardsReturn["data"]>[number];

const InProgressTab = memo(function InProgressTab({
  responses,
}: { responses: MyMissionResponse[] }) {
  if (responses.length === 0) return <EmptyState message="참여 중인 프로젝트가 없어요" />;
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="총" count={responses.length} href={ROUTES.ME_IN_PROGRESS} />
      <InProgressGrid responses={responses.slice(0, MAX_PREVIEW)} />
    </div>
  );
});

const CompletedTab = memo(function CompletedTab({ responses }: { responses: MyMissionResponse[] }) {
  if (responses.length === 0) return <EmptyState message="완료한 프로젝트가 없어요" />;
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="총" count={responses.length} href={ROUTES.ME_COMPLETED} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10">
        {responses.slice(0, MAX_PREVIEW).map(response => (
          <MeProjectCard key={response.id} response={response} variant="completed" />
        ))}
      </div>
    </div>
  );
});

const REWARD_SECTIONS_CONFIG = [
  {
    key: "pending",
    label: "지급 예정 총",
    href: ROUTES.ME_REWARDS_PENDING,
  },
  { key: "paid", label: "지급 완료 총", href: ROUTES.ME_REWARDS_PAID },
] as const;

const RewardsTab = memo(function RewardsTab() {
  const { data: rewards } = useRewards();

  const grouped = useMemo(() => {
    const result: Record<string, RewardItem[]> = { pending: [], paid: [] };
    if (!rewards) return result;
    for (const r of rewards) {
      if (r.paidAt === null) result.pending?.push(r);
      else result.paid?.push(r);
    }
    return result;
  }, [rewards]);

  if (!rewards || rewards.length === 0) return <EmptyState message="받은 리워드가 없어요" />;

  return (
    <div className="flex flex-col gap-10">
      {REWARD_SECTIONS_CONFIG.map(({ key, label, href }) => {
        const items = grouped[key];
        if (items?.length === 0) return null;
        return (
          <div key={key} className="flex flex-col gap-4">
            <SectionHeader label={label} count={items?.length ?? 0} href={href} />
            <div className="flex flex-col gap-6">
              {items?.slice(0, MAX_REWARDS_PREVIEW).map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

const LikedTab = memo(function LikedTab() {
  const { data: likedMissions } = useLikedMissions();

  if (!likedMissions || likedMissions.length === 0)
    return <EmptyState message="찜한 프로젝트가 없어요" />;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label="총" count={likedMissions.length} href={ROUTES.ME_LIKED} />
      <div className="grid grid-cols-2 gap-4">
        {likedMissions.slice(0, MAX_PREVIEW).map(mission => (
          <MeLikedMissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
});

const TABS = [
  { value: "in-progress", label: "참여 중" },
  { value: "completed", label: "참여 완료" },
  { value: "rewards", label: "리워드" },
  { value: "liked", label: "찜" },
] as const;

const DEFAULT_TAB = TABS[0].value;
const VALID_TAB_VALUES = new Set(TABS.map(t => t.value));

export function MyProjectTabs() {
  const { data } = useMyResponses();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [currentTab, setCurrentTab] = useState<string>(
    VALID_TAB_VALUES.has(initialTab as (typeof TABS)[number]["value"])
      ? (initialTab as string)
      : DEFAULT_TAB,
  );

  const { inProgressResponses, completedResponses } = useMemo(() => {
    const responses = data?.data ?? [];
    const inProgress: MyMissionResponse[] = [];
    const completed: MyMissionResponse[] = [];
    for (const r of responses) {
      if (r.completedAt === null) inProgress.push(r);
      else completed.push(r);
    }
    return { inProgressResponses: inProgress, completedResponses: completed };
  }, [data]);

  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
    const url = new URL(window.location.href);
    if (value === DEFAULT_TAB) {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  const tabContent: Record<string, React.ReactNode> = {
    "in-progress": <InProgressTab responses={inProgressResponses} />,
    completed: <CompletedTab responses={completedResponses} />,
    rewards: <RewardsTab />,
    liked: <LikedTab />,
  };

  return (
    <section>
      <Tab.Root
        value={currentTab}
        onValueChange={handleTabChange}
        id="me-events-tab"
        pointColor="secondary"
        scrollable
      >
        <Tab.List>
          {TABS.map(tab => (
            <Tab.Item key={tab.value} value={tab.value}>
              <Typo.Body size="large">{tab.label}</Typo.Body>
            </Tab.Item>
          ))}
        </Tab.List>

        {TABS.map(tab => (
          <Tab.Content key={tab.value} value={tab.value} className="px-5 m-0 pt-8">
            {tabContent[tab.value]}
          </Tab.Content>
        ))}
      </Tab.Root>
    </section>
  );
}
