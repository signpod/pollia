"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadMissions } from "@/hooks/mission/useReadMissions";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import type { Mission } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { ButtonV2, EmptyState, Tab, Typo, useModal } from "@repo/ui/components";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { memo, useCallback, useState } from "react";
import { MissionLikeButton } from "../../(main)/components/MissionLikeButton";
import { useDeleteMissionResponse } from "../hooks/useDeleteMissionResponse";
import { useGroupedRewards } from "../hooks/useGroupedRewards";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyContentTabs } from "../hooks/useMyContentTabs";
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

export function MyContentTabs() {
  const { tabs, currentTab, handleTabChange, inProgressResponses, completedResponses } =
    useMyContentTabs();

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
const VALID_FILTERS = new Set<string>(["in-progress", "completed"]);

function ParticipationTab({
  inProgressResponses,
  completedResponses,
}: {
  inProgressResponses: MyMissionResponse[];
  completedResponses: MyMissionResponse[];
}) {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter");
  const [filter, setFilter] = useState<ParticipationFilter>(
    VALID_FILTERS.has(initialFilter as string)
      ? (initialFilter as ParticipationFilter)
      : "in-progress",
  );

  const handleFilterChange = useCallback((value: ParticipationFilter) => {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "in-progress") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", value);
    }
    window.history.replaceState(null, "", url.toString());
  }, []);
  const allResponses = [...inProgressResponses, ...completedResponses];

  if (allResponses.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title={`참여한 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
        description={
          <>
            아래 버튼을 눌러
            <br />
            새로운 {UBIQUITOUS_CONSTANTS.MISSION}를 구경해보세요
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
              onClick={() => handleFilterChange("in-progress")}
              className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-bold transition-colors ${
                filter === "in-progress" ? "bg-white text-violet-500" : "text-zinc-400"
              }`}
            >
              진행 중 {inProgressResponses.length}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("completed")}
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
            filter === "in-progress"
              ? `진행 중인 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`
              : `완료한 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`
          }
          description={
            <>
              아래 버튼을 눌러
              <br />
              새로운 {UBIQUITOUS_CONSTANTS.MISSION}를 구경해보세요
            </>
          }
          action={<BrowseAction />}
        />
      ) : (
        <div className="flex flex-col">
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
  const router = useRouter();
  const { showModal } = useModal();
  const deleteMutation = useDeleteMissionResponse();
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;

  const handleAction = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (filter === "in-progress") {
        router.push(ROUTES.MISSION(mission.id));
      } else {
        router.push(`${ROUTES.ME_RESULT(mission.id)}?responseId=${response.id}`);
      }
    },
    [mission.id, response.id, filter, router],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showModal({
        title: "참여 내역 삭제",
        description: `참여를 삭제하면 ${UBIQUITOUS_CONSTANTS.MISSION} 응답 데이터에서도 제거됩니다. 되돌릴 수 없습니다.`,
        confirmText: "삭제하기",
        cancelText: "취소",
        showCancelButton: true,
        onConfirm: async () => {
          await deleteMutation.mutateAsync(response.id);
        },
      });
    },
    [showModal, deleteMutation, response.id],
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
      <div className="flex shrink-0 items-center gap-2">
        <ButtonV2 variant="secondary" size="medium" onClick={handleAction}>
          <Typo.ButtonText size="medium">
            {filter === "in-progress" ? "이어서 참여" : "결과보기"}
          </Typo.ButtonText>
        </ButtonV2>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center justify-center text-zinc-300 transition-colors hover:text-red-500"
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>
    </Link>
  );
}

// ─── 찜 탭 ───

function LikedSkeleton() {
  return (
    <div className="flex flex-col gap-4 min-h-[420px]">
      <div className="flex h-9 items-center">
        <div className="h-5 w-16 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: MAX_PREVIEW }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="size-11 shrink-0 animate-pulse rounded-sm bg-zinc-100" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="size-8 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const LikedTab = memo(function LikedTab() {
  const { data: likedMissions, isLoading } = useLikedMissions();

  if (isLoading) return <LikedSkeleton />;

  if (!likedMissions || likedMissions.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title={`찜한 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
        description={
          <>
            아래 버튼을 눌러
            <br />
            마음에 드는 {UBIQUITOUS_CONSTANTS.MISSION}를 찜해보세요
          </>
        }
        action={<BrowseAction />}
      />
    );
  }

  return (
    <TabSection count={likedMissions.length} emptyMessage="" label="총" href={ROUTES.ME_LIKED_TAB}>
      <div className="flex flex-col">
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
      <Typo.Body
        size="small"
        className={`shrink-0 rounded-md px-2 py-1 ${
          isPaid ? "bg-zinc-100 text-zinc-500" : "bg-orange-50 text-orange-600"
        }`}
      >
        {badgeText}
      </Typo.Body>
    </div>
  );

  if (missionId) {
    return <Link href={ROUTES.MISSION(missionId)}>{content}</Link>;
  }

  return content;
}

function RewardsSkeleton() {
  return (
    <div className="flex flex-col gap-4 min-h-[420px]">
      <div className="flex h-9 items-center">
        <div className="h-5 w-20 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: MAX_REWARDS_PREVIEW }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="size-11 shrink-0 animate-pulse rounded-sm bg-zinc-100" />
            <div className="flex-1">
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-6 w-24 animate-pulse rounded-md bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const RewardsTab = memo(function RewardsTab() {
  const { rewards, grouped, isLoading } = useGroupedRewards();

  if (isLoading) return <RewardsSkeleton />;

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
            리워드가 있는 {UBIQUITOUS_CONSTANTS.MISSION}를 찾아보세요
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
            <div className="flex flex-col">
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

function MyContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 min-h-[420px]">
      <div className="flex h-9 items-center">
        <div className="h-5 w-16 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: MAX_PREVIEW }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="size-11 shrink-0 animate-pulse rounded-sm bg-zinc-100" />
            <div className="flex-1">
              <div className="h-4 w-3/5 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-6 w-14 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const MyContentTab = memo(function MyContentTab() {
  const { data, isLoading } = useReadMissions({ options: { limit: MAX_PREVIEW } });

  if (isLoading) return <MyContentSkeleton />;

  const missions = data?.pages.flatMap(page => page.data) ?? [];

  if (missions.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title={`만든 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
        description={
          <>
            나만의 {UBIQUITOUS_CONSTANTS.MISSION}를 만들어
            <br />
            다양한 사람들의 의견을 모아보세요 ✨
          </>
        }
        action={
          <div className="flex justify-center gap-2">
            <Link href={`${ROUTES.CREATE_MISSION}?category=RESEARCH`}>
              <ButtonV2 variant="primary" className="w-auto">
                <Typo.ButtonText size="large">📋 설문조사/리서치</Typo.ButtonText>
              </ButtonV2>
            </Link>
            <Link href={`${ROUTES.CREATE_MISSION}?category=TEST`}>
              <ButtonV2 variant="secondary" className="w-auto">
                <Typo.ButtonText size="large">🧠 심리/유형 테스트</Typo.ButtonText>
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
          <PencilIcon className="size-[13px]" />새 {UBIQUITOUS_CONSTANTS.MISSION}
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
