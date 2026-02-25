"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import { ButtonV2, EmptyState, Tab, Typo } from "@repo/ui/components";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { memo } from "react";
import { useGroupedRewards } from "../hooks/useGroupedRewards";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyContentMissions } from "../hooks/useMyContentMissions";
import { useMyProjectTabs } from "../hooks/useMyProjectTabs";
import { InProgressGrid } from "./InProgressGrid";
import { MeLikedMissionCard } from "./MeLikedMissionCard";
import { MeProjectCard } from "./MeProjectCard";
import { RewardCard } from "./RewardCard";
import { SectionHeader } from "./SectionHeader";

const MAX_PREVIEW = 4;
const MAX_REWARDS_PREVIEW = 3;

function BrowseAction() {
  return (
    <div className="flex justify-center">
      <Link href={ROUTES.HOME}>
        <ButtonV2 variant="primary" className="w-auto">
          <Typo.ButtonText size="large">구경하러 가기</Typo.ButtonText>
        </ButtonV2>
      </Link>
    </div>
  );
}

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
    "my-content": <MyContentTab />,
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
        <Tab.List className="bg-white">
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
  if (responses.length === 0) {
    return (
      <EmptyState
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="참여중인 프로젝트가 없어요"
        description={
          <>
            아래 버튼을 눌러
            <br />
            새로운 프로젝트를 구경해보세요 🤩
          </>
        }
        action={<BrowseAction />}
      />
    );
  }

  return (
    <TabSection count={responses.length} emptyMessage="" label="총" href={ROUTES.ME_IN_PROGRESS}>
      <InProgressGrid responses={responses.slice(0, MAX_PREVIEW)} />
    </TabSection>
  );
});

const CompletedTab = memo(function CompletedTab({ responses }: { responses: MyMissionResponse[] }) {
  if (responses.length === 0) {
    return (
      <EmptyState
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="완료한 프로젝트가 없어요"
        description={
          <>
            프로젝트를 완료하고
            <br />이 곳에서 결과를 다시 확인해보세요 🎵
          </>
        }
        action={<BrowseAction />}
      />
    );
  }

  return (
    <TabSection count={responses.length} emptyMessage="" label="총" href={ROUTES.ME_COMPLETED}>
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

  if (!rewards || rewards.length === 0) {
    return (
      <EmptyState
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="받은 리워드가 없어요"
        description={
          <>
            아래 버튼을 눌러
            <br />
            리워드가 있는 프로젝트를 찾아보세요 🎁
          </>
        }
        action={<BrowseAction />}
      />
    );
  }

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
            <div className="flex flex-col gap-4">
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

  if (!likedMissions || likedMissions.length === 0) {
    return (
      <EmptyState
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="찜한 프로젝트가 없어요"
        description={
          <>
            아래 버튼을 눌러
            <br />
            마음에 드는 프로젝트를 찜해보세요 ❤️
          </>
        }
        action={<BrowseAction />}
      />
    );
  }

  return (
    <TabSection count={likedMissions.length} emptyMessage="" label="총" href={ROUTES.ME_LIKED_TAB}>
      <div className="grid grid-cols-2 gap-4">
        {likedMissions.slice(0, MAX_PREVIEW).map(mission => (
          <MeLikedMissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </TabSection>
  );
});

function MyContentAction() {
  return (
    <div className="flex justify-center">
      <Link href={ROUTES.CREATE}>
        <ButtonV2 variant="primary" className="w-auto">
          <Plus className="mr-1 size-4" />
          <Typo.ButtonText size="large">만들러 가기</Typo.ButtonText>
        </ButtonV2>
      </Link>
    </div>
  );
}

const MyContentTab = memo(function MyContentTab() {
  const { data, isLoading } = useMyContentMissions();
  const missions = data?.data ?? [];

  if (isLoading) {
    return null;
  }

  if (missions.length === 0) {
    return (
      <EmptyState
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="만든 콘텐츠가 없어요"
        description={
          <>
            아래 버튼을 눌러
            <br />새 미션을 만들어 보세요 ✨
          </>
        }
        action={<MyContentAction />}
      />
    );
  }

  return (
    <TabSection count={missions.length} emptyMessage="" label="총" href={ROUTES.ME_MY_CONTENT}>
      <div className="flex flex-col gap-4">
        {missions.slice(0, MAX_PREVIEW).map(mission => (
          <Link
            key={mission.id}
            href={ROUTES.CREATE_EDITOR(mission.id)}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50"
          >
            <div className="min-w-0 flex-1">
              <Typo.Body size="medium" className="font-medium text-zinc-900 truncate">
                {mission.title || "제목 없음"}
              </Typo.Body>
              <Typo.Body size="small" className="text-zinc-500">
                {MISSION_CATEGORY_LABELS[mission.category] ?? mission.category}
              </Typo.Body>
            </div>
            <Typo.Body size="small" className="shrink-0 text-zinc-400">
              편집 →
            </Typo.Body>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <MyContentAction />
      </div>
    </TabSection>
  );
});

function TabSection({ count, emptyMessage, label, href, children }: TabSectionProps) {
  if (count === 0) return <EmptyState title={emptyMessage} />;
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader label={label} count={count} href={href} showViewAll={count >= MAX_PREVIEW} />
      {children}
    </div>
  );
}
