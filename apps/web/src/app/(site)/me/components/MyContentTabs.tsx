"use client";

import { CreateMissionBottomSheet } from "@/components/common/CreateMissionBottomSheet";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useReadMissions } from "@/hooks/mission/useReadMissions";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import type { Mission } from "@prisma/client";
import thumbnailFallback from "@public/images/thumbnail-fallback.png";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import {
  ButtonV2,
  EmptyState,
  Pagination,
  SegmentedControl,
  Tab,
  Typo,
  useModal,
} from "@repo/ui/components";
import { PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { memo, useCallback, useState } from "react";
import { MissionLikeButton } from "../../(main)/components/MissionLikeButton";
import { useDeleteMission } from "../hooks/useDeleteMission";
import { useDeleteMissionResponse } from "../hooks/useDeleteMissionResponse";
import { useGroupedRewards } from "../hooks/useGroupedRewards";
import { useLikedMissions } from "../hooks/useLikedMissions";
import { useMyContentTabs } from "../hooks/useMyContentTabs";

const MAX_REWARDS_PREVIEW = 3;
const PARTICIPATION_PAGE_SIZE = 5;
const LIKED_PAGE_SIZE = 5;
const REWARD_PAGE_SIZE = 5;
const MY_CONTENT_PAGE_SIZE = 5;
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
  const [page, setPage] = useState(1);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value as ParticipationFilter);
    setPage(1);
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
  const totalPages = Math.ceil(filtered.length / PARTICIPATION_PAGE_SIZE);
  const paged = filtered.slice(
    (page - 1) * PARTICIPATION_PAGE_SIZE,
    page * PARTICIPATION_PAGE_SIZE,
  );

  return (
    <div className="flex min-h-[420px] flex-col gap-6">
      <SegmentedControl
        items={[
          { value: "in-progress", label: "진행 중" },
          { value: "completed", label: "완료" },
        ]}
        value={filter}
        onValueChange={handleFilterChange}
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
        <div className="flex flex-col gap-4">
          <Typo.SubTitle size="large">총 {filtered.length}개</Typo.SubTitle>
          <div className="flex min-h-[609px] flex-col">
            {paged.map((response, index) => (
              <div key={response.id}>
                <ParticipationListItem response={response} filter={filter} />
                {index < paged.length - 1 && <div className="h-px w-full bg-zinc-100" />}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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
    <div className="flex gap-3 py-4">
      <Link
        href={ROUTES.MISSION(mission.id)}
        className="relative size-[89px] shrink-0 overflow-hidden rounded-xl border border-zinc-200"
      >
        <Image
          src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
          alt={mission.title}
          fill
          sizes="89px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start gap-1">
          <Link href={ROUTES.MISSION(mission.id)} className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typo.Body size="small" className="truncate font-bold text-zinc-500">
              {categoryLabel}
            </Typo.Body>
            <Typo.Body size="medium" className="truncate">
              {mission.title}
            </Typo.Body>
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 p-0.5 text-zinc-400 transition-colors hover:text-red-500"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <ButtonV2 variant="secondary" size="medium" className="w-full" onClick={handleAction}>
          <div className="flex w-full items-center justify-center">
            <Typo.ButtonText size="medium">
              {filter === "in-progress" ? "이어하기" : "결과보기"}
            </Typo.ButtonText>
          </div>
        </ButtonV2>
      </div>
    </div>
  );
}

// ─── 찜 탭 ───

function LikedSkeleton() {
  return (
    <div className="flex min-h-[420px] flex-col gap-4">
      <div className="h-6 w-16 animate-pulse rounded bg-zinc-100" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: LIKED_PAGE_SIZE }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="size-[89px] shrink-0 animate-pulse rounded-xl bg-zinc-100" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
              <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LikedTab = memo(function LikedTab() {
  const { data: likedMissions, isLoading } = useLikedMissions();
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(likedMissions.length / LIKED_PAGE_SIZE);
  const paged = likedMissions.slice((page - 1) * LIKED_PAGE_SIZE, page * LIKED_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <Typo.SubTitle size="large">총 {likedMissions.length}개</Typo.SubTitle>
      <div className="flex min-h-[509px] flex-col gap-4">
        {paged.map(mission => (
          <LikedListItem key={mission.id} mission={mission} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
});

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  return String(count);
}

function LikedListItem({ mission }: { mission: Mission }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;

  return (
    <div className="flex items-start gap-3">
      <Link
        href={ROUTES.MISSION(mission.id)}
        className="relative size-[89px] shrink-0 overflow-hidden rounded-xl border border-zinc-200"
      >
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-6 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={mission.imageUrl!}
            alt={mission.title}
            fill
            sizes="89px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </Link>
      <Link
        href={ROUTES.MISSION(mission.id)}
        className="flex min-w-0 flex-1 flex-col gap-0.5 self-stretch"
      >
        <Typo.Body size="small" className="truncate font-bold text-zinc-500">
          {categoryLabel}
        </Typo.Body>
        <Typo.Body size="medium" className="truncate">
          {mission.title}
        </Typo.Body>
        <Typo.Body size="small" className="text-[11px] font-bold text-zinc-400">
          조회 {formatCount(mission.viewCount)} · 찜 {formatCount(mission.likesCount)}
        </Typo.Body>
      </Link>
      <MissionLikeButton missionId={mission.id} />
    </div>
  );
}

// ─── 리워드 탭 ───

type RewardFilter = "pending" | "paid";

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
    <div className="flex items-start gap-3">
      <div className="relative size-[89px] shrink-0 overflow-hidden rounded-xl border border-zinc-200">
        {showFallback ? (
          <div className="flex size-full items-center justify-center bg-zinc-50">
            <PollPollE className="size-6 text-zinc-200" />
          </div>
        ) : (
          <Image
            src={reward.imageUrl ?? ""}
            alt={reward.name}
            fill
            sizes="89px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch">
        <Typo.Body
          size="small"
          className={`w-fit rounded-[6px] px-2 py-0.5 font-bold ${
            isPaid ? "bg-zinc-100 text-zinc-500" : "bg-violet-50 text-violet-500"
          }`}
        >
          {badgeText}
        </Typo.Body>
        <Typo.Body size="medium">{reward.name}</Typo.Body>
      </div>
    </div>
  );

  if (missionId) {
    return <Link href={ROUTES.MISSION(missionId)}>{content}</Link>;
  }

  return content;
}

function RewardsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
      <div className="flex flex-col gap-4">
        <div className="h-6 w-16 animate-pulse rounded bg-zinc-100" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: REWARD_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-[89px] shrink-0 animate-pulse rounded-xl bg-zinc-100" />
              <div className="flex flex-1 flex-col gap-1.5 pt-1">
                <div className="h-5 w-28 animate-pulse rounded-md bg-zinc-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RewardsTab = memo(function RewardsTab() {
  const { rewards, grouped, isLoading } = useGroupedRewards();
  const [filter, setFilter] = useState<RewardFilter>("pending");
  const [page, setPage] = useState(1);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value as RewardFilter);
    setPage(1);
  }, []);

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

  const filtered = grouped[filter] ?? [];
  const totalPages = Math.ceil(filtered.length / REWARD_PAGE_SIZE);
  const paged = filtered.slice((page - 1) * REWARD_PAGE_SIZE, page * REWARD_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl
        items={[
          { value: "pending", label: "지급 예정" },
          { value: "paid", label: "지급 완료" },
        ]}
        value={filter}
        onValueChange={handleFilterChange}
      />

      {filtered.length === 0 ? (
        <EmptyState
          className={EMPTY_STATE_CLASS}
          icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
          title={filter === "pending" ? "지급 예정 리워드가 없어요" : "지급 완료 리워드가 없어요"}
          description={
            <>
              아래 버튼을 눌러
              <br />
              리워드가 있는 {UBIQUITOUS_CONSTANTS.MISSION}를 찾아보세요
            </>
          }
          action={<BrowseAction />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Typo.SubTitle size="large">총 {filtered.length}개</Typo.SubTitle>
          <div className="flex min-h-[509px] flex-col gap-4">
            {paged.map(reward => (
              <RewardListItem key={reward.id} reward={reward} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
});

// ─── 내 콘텐츠 탭 ───

type MyContentFilter = "public" | "link-only" | "private";

function filterMissionsByVisibility(missions: Mission[], filter: MyContentFilter) {
  switch (filter) {
    case "public":
      return missions.filter(m => m.isActive && m.type === "GENERAL");
    case "link-only":
      return missions.filter(m => m.isActive && m.type === "EXPERIENCE_GROUP");
    case "private":
      return missions.filter(m => !m.isActive);
  }
}

function MyContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-11 w-full animate-pulse rounded-xl bg-zinc-100" />
      <div className="flex flex-col gap-4">
        <div className="h-6 w-16 animate-pulse rounded bg-zinc-100" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: MY_CONTENT_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-[89px] shrink-0 animate-pulse rounded-xl bg-zinc-100" />
              <div className="flex flex-1 flex-col gap-1.5 pt-1">
                <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MyContentTab = memo(function MyContentTab() {
  const { data, isLoading } = useReadMissions({ options: { limit: 100 } });
  const [filter, setFilter] = useState<MyContentFilter>("public");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { showModal } = useModal();
  const deleteMutation = useDeleteMission();

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value as MyContentFilter);
    setPage(1);
  }, []);

  const handleDelete = useCallback(
    (missionId: string) => {
      showModal({
        title: `${UBIQUITOUS_CONSTANTS.MISSION} 삭제`,
        description: `${UBIQUITOUS_CONSTANTS.MISSION}를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다.\n되돌릴 수 없습니다.`,
        confirmText: "삭제하기",
        cancelText: "취소",
        showCancelButton: true,
        onConfirm: async () => {
          await deleteMutation.mutateAsync(missionId);
        },
      });
    },
    [showModal, deleteMutation],
  );

  if (isLoading) return <MyContentSkeleton />;

  const allMissions = data?.pages.flatMap(p => p.data) ?? [];

  if (allMissions.length === 0) {
    return (
      <EmptyState
        className={EMPTY_STATE_CLASS}
        icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
        title={`만든 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
        description={
          <>
            나만의 {UBIQUITOUS_CONSTANTS.MISSION}를 만들어
            <br />
            다양한 사람들의 의견을 모아보세요
          </>
        }
        action={
          <div className="flex justify-center gap-2">
            <Link href={`${ROUTES.CREATE_MISSION}?category=RESEARCH`}>
              <ButtonV2 variant="primary" className="w-auto">
                <Typo.ButtonText size="large">설문조사/리서치</Typo.ButtonText>
              </ButtonV2>
            </Link>
            <Link href={`${ROUTES.CREATE_MISSION}?category=TEST`}>
              <ButtonV2 variant="secondary" className="w-auto">
                <Typo.ButtonText size="large">심리/유형 테스트</Typo.ButtonText>
              </ButtonV2>
            </Link>
          </div>
        }
      />
    );
  }

  const filtered = filterMissionsByVisibility(allMissions, filter);
  const totalPages = Math.ceil(filtered.length / MY_CONTENT_PAGE_SIZE);
  const paged = filtered.slice((page - 1) * MY_CONTENT_PAGE_SIZE, page * MY_CONTENT_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl
        items={[
          { value: "public", label: "전체 공개" },
          { value: "link-only", label: "링크 공개" },
          { value: "private", label: "나만 보기" },
        ]}
        value={filter}
        onValueChange={handleFilterChange}
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-[509px] flex-col">
          <EmptyState
            className="flex-1 justify-center"
            icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
            title={`해당하는 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
            description={
              <>
                아래 버튼을 눌러
                <br />
                새로운 {UBIQUITOUS_CONSTANTS.MISSION}를 만들어보세요
              </>
            }
            action={
              <div className="flex justify-center gap-2">
                <Link href={`${ROUTES.CREATE_MISSION}?category=RESEARCH`}>
                  <ButtonV2 variant="primary" className="w-auto">
                    <Typo.ButtonText size="large">설문조사/리서치</Typo.ButtonText>
                  </ButtonV2>
                </Link>
                <Link href={`${ROUTES.CREATE_MISSION}?category=TEST`}>
                  <ButtonV2 variant="secondary" className="w-auto">
                    <Typo.ButtonText size="large">심리/유형 테스트</Typo.ButtonText>
                  </ButtonV2>
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typo.SubTitle size="large">총 {filtered.length}개</Typo.SubTitle>
            <ButtonV2 variant="secondary" size="medium" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon className="size-4" />
              <Typo.ButtonText size="medium">새 콘텐츠</Typo.ButtonText>
            </ButtonV2>
          </div>
          <div className="flex min-h-[509px] flex-col gap-4">
            {paged.map(mission => (
              <MyContentListItem key={mission.id} mission={mission} onDelete={handleDelete} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <CreateMissionBottomSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
});

function MyContentListItem({
  mission,
  onDelete,
}: { mission: Mission; onDelete: (id: string) => void }) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !mission.imageUrl;
  const categoryLabel =
    MISSION_CATEGORY_LABELS[mission.category as keyof typeof MISSION_CATEGORY_LABELS] ??
    mission.category;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(mission.id);
  };

  return (
    <div className="flex items-start gap-2">
      <Link href={ROUTES.EDITOR_MISSION(mission.id)} className="flex min-w-0 flex-1 gap-3">
        <div className="relative size-[89px] shrink-0 overflow-hidden rounded-xl border border-zinc-200">
          <Image
            src={showFallback ? thumbnailFallback : (mission.imageUrl ?? "")}
            alt={mission.title}
            fill
            sizes="89px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 self-stretch">
          <Typo.Body size="small" className="truncate font-bold text-zinc-500">
            {categoryLabel}
          </Typo.Body>
          <Typo.Body size="medium">{mission.title}</Typo.Body>
          <Typo.Body size="small" className="text-[11px] font-bold text-zinc-400">
            조회 {formatCount(mission.viewCount)} · 찜 {formatCount(mission.likesCount)}
          </Typo.Body>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="shrink-0 p-0.5 text-zinc-400 transition-colors hover:text-red-500"
        aria-label={`${UBIQUITOUS_CONSTANTS.MISSION} 삭제`}
      >
        <XIcon className="size-5" />
      </button>
    </div>
  );
}
