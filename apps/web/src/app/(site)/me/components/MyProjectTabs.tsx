"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import { useReadMissions } from "@/hooks/mission/useReadMissions";
import { useResumeToNextAction } from "@/hooks/mission/useResumeToNextAction";
import { setActionNavCookie } from "@/lib/cookie";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import type { Mission } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { ButtonV2, EmptyState, Tab, Typo } from "@repo/ui/components";
import { PencilIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { memo, useCallback, useState } from "react";
import { MissionLikeButton } from "../../(main)/components/MissionLikeButton";
import { useGroupedRewards } from "../hooks/useGroupedRewards";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyProjectTabs } from "../hooks/useMyProjectTabs";
import { MyContentList } from "./MyContentList";
import { SectionHeader } from "./SectionHeader";

const MAX_PREVIEW = 4;
const MAX_REWARDS_PREVIEW = 3;
const EMPTY_STATE_CLASS = "min-h-[420px] justify-center";

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
  rightAction?: ReactNode;
}

export function MyProjectTabs() {
  const { tabs, currentTab, handleTabChange, inProgressResponses, completedResponses } =
    useMyProjectTabs();

  const tabContent: Record<string, ReactNode> = {
    "my-content": <MyContentTab />,
    participation: (
      <ParticipationTab
        inProgressResponses={inProgressResponses}
        completedResponses={completedResponses}
      />
    ),
    liked: <LikedTab />,
    rewards: <RewardsTab />,
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
        <Tab.List className="sticky top-12 z-10 bg-white">
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

// ─── 참여 탭 ───

type ParticipationFilter = "in-progress" | "completed";

function ParticipationTab({
  inProgressResponses,
  completedResponses,
}: {
  inProgressResponses: MyMissionResponse[];
  completedResponses: MyMissionResponse[];
}) {
  const [filter, setFilter] = useState<ParticipationFilter>("in-progress");
  const allResponses = [...inProgressResponses, ...completedResponses];

  if (allResponses.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="참여한 프로젝트가 없어요"
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

  const filtered = filter === "in-progress" ? inProgressResponses : completedResponses;

  return (
    <div className="flex min-h-[420px] flex-col gap-4">
      <SectionHeader
        label="총"
        count={filtered.length}
        showViewAll={false}
        rightAction={
          <div className="flex h-8 items-center rounded-full bg-zinc-100 p-0.5">
            <button
              type="button"
              onClick={() => setFilter("in-progress")}
              className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-bold transition-colors ${
                filter === "in-progress" ? "bg-white text-violet-500" : "text-zinc-400"
              }`}
            >
              진행 중 {inProgressResponses.length}
            </button>
            <button
              type="button"
              onClick={() => setFilter("completed")}
              className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-bold transition-colors ${
                filter === "completed" ? "bg-white text-violet-500" : "text-zinc-400"
              }`}
            >
              완료 {completedResponses.length}
            </button>
          </div>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState
          className={EMPTY_STATE_CLASS}
          icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
          title={
            filter === "in-progress" ? "진행 중인 프로젝트가 없어요" : "완료한 프로젝트가 없어요"
          }
          description={
            <>
              아래 버튼을 눌러
              <br />
              새로운 프로젝트를 구경해보세요 🤩
            </>
          }
          action={<BrowseAction />}
        />
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {filtered.map(response => (
            <ParticipationListItem key={response.id} response={response} filter={filter} />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipationListItem({
  response,
  filter,
}: { response: MyMissionResponse; filter: ParticipationFilter }) {
  const { mission } = response;
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;

  const { nextActionId } = useResumeToNextAction({
    missionId: mission.id,
    answers: response.answers,
  });

  const handleAction = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (filter === "in-progress") {
        if (!nextActionId) return;
        setActionNavCookie(mission.id, "resume");
        window.open(ROUTES.ACTION({ missionId: mission.id, actionId: nextActionId }), "_blank");
      } else {
        window.open(ROUTES.MISSION(mission.id), "_blank");
      }
    },
    [mission.id, filter, nextActionId],
  );

  return (
    <Link href={ROUTES.MISSION(mission.id)} className="flex items-center gap-3 py-3">
      <div className="relative size-11 shrink-0 overflow-hidden rounded-sm">
        <Image
          src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
          alt={mission.title}
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typo.Body size="small" className="text-info">
          {categoryLabel}
        </Typo.Body>
        <Typo.SubTitle size="large" className="truncate">
          {mission.title}
        </Typo.SubTitle>
      </div>
      <ButtonV2 variant="secondary" size="medium" onClick={handleAction} className="shrink-0">
        <Typo.ButtonText size="medium">
          {filter === "in-progress" ? "계속하기" : "결과보기"}
        </Typo.ButtonText>
      </ButtonV2>
    </Link>
  );
}

// ─── 찜 탭 ───

const LikedTab = memo(function LikedTab() {
  const { data: likedMissions } = useLikedMissions();

  if (!likedMissions || likedMissions.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
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
      <div className="flex flex-col divide-y divide-zinc-100">
        {likedMissions.slice(0, MAX_PREVIEW).map(mission => (
          <LikedListItem key={mission.id} mission={mission} />
        ))}
      </div>
    </TabSection>
  );
});

function LikedListItem({ mission }: { mission: Mission }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;

  return (
    <Link href={ROUTES.MISSION(mission.id)} className="flex items-center gap-3 py-3">
      <div className="relative size-11 shrink-0 overflow-hidden rounded-sm">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-6 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={mission.imageUrl!}
            alt={mission.title}
            fill
            sizes="44px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typo.Body size="small" className="text-info">
          {categoryLabel}
        </Typo.Body>
        <Typo.SubTitle size="large" className="truncate">
          {mission.title}
        </Typo.SubTitle>
      </div>
      <MissionLikeButton missionId={mission.id} />
    </Link>
  );
}

// ─── 리워드 탭 ───

const REWARD_SECTIONS_CONFIG = [
  { key: "pending", label: "지급 예정 총", href: ROUTES.ME_REWARDS_PENDING },
  { key: "paid", label: "지급 완료 총", href: ROUTES.ME_REWARDS_PAID },
] as const;

function formatDate(date: Date): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

interface RewardItemProps {
  reward: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    paymentType: string;
    scheduledDate: Date | null;
    paidAt: Date | null;
    missions: { id: string }[];
  };
}

function RewardListItem({ reward }: RewardItemProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !reward.imageUrl;
  const isPaid = reward.paidAt !== null;
  const statusDate = isPaid ? reward.paidAt : reward.scheduledDate;
  const statusLabel = isPaid ? "지급 완료" : "지급 예정";
  const badgeText = statusDate ? `${formatDate(statusDate)} ${statusLabel}` : statusLabel;
  const missionId = reward.missions[0]?.id;

  const content = (
    <div className="flex items-center gap-3 py-3">
      <div className="relative size-11 shrink-0 overflow-hidden rounded-sm border border-zinc-100">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-6 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={reward.imageUrl ?? ""}
            alt={reward.name}
            fill
            sizes="44px"
            className="object-contain"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typo.SubTitle size="large" className="truncate">
          {reward.name}
        </Typo.SubTitle>
      </div>
      <span
        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
          isPaid ? "bg-zinc-100 text-zinc-500" : "bg-orange-50 text-orange-600"
        }`}
      >
        {badgeText}
      </span>
    </div>
  );

  if (missionId) {
    return <Link href={ROUTES.MISSION(missionId)}>{content}</Link>;
  }

  return content;
}

const RewardsTab = memo(function RewardsTab() {
  const { rewards, grouped } = useGroupedRewards();

  if (!rewards || rewards.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
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
            <div className="flex flex-col divide-y divide-zinc-100">
              {items?.slice(0, MAX_REWARDS_PREVIEW).map(reward => (
                <RewardListItem key={reward.id} reward={reward} />
              ))}
            </div>
          </TabSection>
        );
      })}
    </div>
  );
});

// ─── 내 콘텐츠 탭 ───

const MyContentTab = memo(function MyContentTab() {
  const { data } = useReadMissions({ options: { limit: MAX_PREVIEW } });
  const missions = data?.pages.flatMap(page => page.data) ?? [];

  if (missions.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title="만든 콘텐츠가 없어요"
        description={
          <>
            나만의 프로젝트를 만들어
            <br />
            다양한 사람들의 의견을 모아보세요 ✨
          </>
        }
        action={
          <div className="flex justify-center">
            <Link href={ROUTES.CREATE_MISSION}>
              <ButtonV2 variant="primary" className="w-auto">
                <Typo.ButtonText size="large">첫 콘텐츠 만들기</Typo.ButtonText>
              </ButtonV2>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <TabSection
      count={missions.length}
      emptyMessage=""
      label="총"
      href={ROUTES.ME_MY_CONTENT}
      rightAction={
        <Link
          href={ROUTES.CREATE_MISSION}
          className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-1.5 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-100"
        >
          <PencilIcon className="size-[13px]" />새 콘텐츠
        </Link>
      }
    >
      <MyContentList missions={missions.slice(0, MAX_PREVIEW)} />
    </TabSection>
  );
});

// ─── 공통 ───

function TabSection({ count, emptyMessage, label, href, children, rightAction }: TabSectionProps) {
  if (count === 0) return <EmptyState title={emptyMessage} />;
  return (
    <div className="flex flex-col gap-4 min-h-[420px]">
      <SectionHeader
        label={label}
        count={count}
        href={href}
        showViewAll={count >= MAX_PREVIEW}
        rightAction={rightAction}
      />
      {children}
    </div>
  );
}
