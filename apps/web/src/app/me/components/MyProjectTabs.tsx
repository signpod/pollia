"use client";

import { ROUTES } from "@/constants/routes";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import { EmptyState, Tab, Typo } from "@repo/ui/components";
import type { ReactNode } from "react";
import { memo } from "react";
import { useGroupedRewards } from "../hooks/useGroupedRewards";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyProjectTabs } from "../hooks/useMyProjectTabs";
import { InProgressGrid } from "./InProgressGrid";
import { MeLikedMissionCard } from "./MeLikedMissionCard";
import { MeProjectCard } from "./MeProjectCard";
import { RewardCard } from "./RewardCard";
import { SectionHeader } from "./SectionHeader";

const MAX_PREVIEW = 4;
const MAX_REWARDS_PREVIEW = 3;

interface TabSectionProps {
  count: number;
  emptyMessage: string;
  label: string;
  href: string;
  children: ReactNode;
}

export function MyProjectTabs() {
  const { tabs, currentTab, handleTabChange, inProgressResponses, completedResponses } =
    useMyProjectTabs();

  const tabContent: Record<string, ReactNode> = {
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
          {tabs.map(tab => (
            <Tab.Item key={tab.value} value={tab.value}>
              <Typo.Body size="large">{tab.label}</Typo.Body>
            </Tab.Item>
          ))}
        </Tab.List>

        {tabs.map(tab => (
          <Tab.Content key={tab.value} value={tab.value} className="px-5 m-0 pt-8">
            {tabContent[tab.value]}
          </Tab.Content>
        ))}
      </Tab.Root>
    </section>
  );
}

const InProgressTab = memo(function InProgressTab({
  responses,
}: { responses: MyMissionResponse[] }) {
  return (
    <TabSection
      count={responses.length}
      emptyMessage="참여 중인 프로젝트가 없어요"
      label="총"
      href={ROUTES.ME_IN_PROGRESS}
    >
      <InProgressGrid responses={responses.slice(0, MAX_PREVIEW)} />
    </TabSection>
  );
});

const CompletedTab = memo(function CompletedTab({ responses }: { responses: MyMissionResponse[] }) {
  return (
    <TabSection
      count={responses.length}
      emptyMessage="완료한 프로젝트가 없어요"
      label="총"
      href={ROUTES.ME_COMPLETED}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-10">
        {responses.slice(0, MAX_PREVIEW).map(response => (
          <MeProjectCard key={response.id} response={response} variant="completed" />
        ))}
      </div>
    </TabSection>
  );
});

const REWARD_SECTIONS_CONFIG = [
  { key: "pending", label: "지급 예정 총", href: ROUTES.ME_REWARDS_PENDING },
  { key: "paid", label: "지급 완료 총", href: ROUTES.ME_REWARDS_PAID },
] as const;

const RewardsTab = memo(function RewardsTab() {
  const { rewards, grouped } = useGroupedRewards();

  if (!rewards || rewards.length === 0) return <EmptyState title="받은 리워드가 없어요" />;

  return (
    <div className="flex flex-col gap-10">
      {REWARD_SECTIONS_CONFIG.map(({ key, label, href }) => {
        const items = grouped[key];
        if (items?.length === 0) return null;
        return (
          <TabSection
            key={key}
            count={items?.length ?? 0}
            emptyMessage=""
            label={label}
            href={href}
          >
            <div className="flex flex-col gap-6">
              {items?.slice(0, MAX_REWARDS_PREVIEW).map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </TabSection>
        );
      })}
    </div>
  );
});

const LikedTab = memo(function LikedTab() {
  const { data: likedMissions } = useLikedMissions();

  return (
    <TabSection
      count={likedMissions?.length ?? 0}
      emptyMessage="찜한 프로젝트가 없어요"
      label="총"
      href={ROUTES.ME_LIKED_TAB}
    >
      <div className="grid grid-cols-2 gap-4">
        {likedMissions?.slice(0, MAX_PREVIEW).map(mission => (
          <MeLikedMissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </TabSection>
  );
});

function TabSection({ count, emptyMessage, label, href, children }: TabSectionProps) {
  if (count === 0) return <EmptyState title={emptyMessage} />;
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label={label} count={count} href={href} />
      {children}
    </div>
  );
}
