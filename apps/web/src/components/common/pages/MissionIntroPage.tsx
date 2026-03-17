"use client";

import { LoginDrawer } from "@/app/(site)/(main)/components/LoginDrawer";
import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { useDeleteMission } from "@/app/(site)/me/hooks/useDeleteMission";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import type { MissionRewardData } from "@/app/(site)/mission/[missionId]/types/mission";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { ROUTES, WHITE_LABEL_PREFIX } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCurrentUser } from "@/hooks/user";
import { cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { ButtonV2, FixedBottomLayout, Typo, useDrawer, useModal } from "@repo/ui/components";
import { ChevronLeftIcon, EllipsisVerticalIcon, PencilLineIcon, Trash2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MissionContentTemplate } from "../templates/MissionContentTemplate";
import { MissionIntroTemplate } from "../templates/MissionIntroTemplate";
import type { MissionIntroTemplateProps } from "../templates/MissionIntroTemplate";

export interface MissionIntroPageProps extends MissionIntroTemplateProps {
  isRequirePassword: boolean;
  missionId: string;
  creatorId?: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  reward: MissionRewardData | null;
  contextTitle?: string;
  bottomButton?: ReactNode;
  viewCount?: number;
  likesCount?: number;
}

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2
      variant="tertiary"
      size="medium"
      onClick={open}
      className="text-sub border border-default"
    >
      <Typo.ButtonText size="medium">로그인/가입</Typo.ButtonText>
    </ButtonV2>
  );
}

function MissionLoginDrawer() {
  return (
    <LoginDrawer>
      <LoginDrawerTrigger />
    </LoginDrawer>
  );
}

function OwnerActionSheet({
  isOpen,
  onClose,
  missionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
}) {
  const router = useRouter();
  const { showModal } = useModal();
  const deleteMutation = useDeleteMission();

  const handleEdit = () => {
    onClose();
    router.push(ROUTES.EDITOR_MISSION(missionId));
  };

  const handleDelete = () => {
    onClose();
    showModal({
      title: `${UBIQUITOUS_CONSTANTS.MISSION} 삭제`,
      description: `${UBIQUITOUS_CONSTANTS.MISSION}를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다.\n되돌릴 수 없습니다.`,
      confirmText: "삭제하기",
      cancelText: "취소",
      showCancelButton: true,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(missionId);
        router.replace(ROUTES.HOME);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} onKeyDown={undefined} />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[600px] animate-in slide-in-from-bottom rounded-t-2xl bg-white shadow-[0px_4px_20px_0px_rgba(9,9,11,0.16)]">
        <div className="flex flex-col gap-2 px-5 pb-3 pt-5">
          <ButtonV2
            variant="tertiary"
            onClick={handleEdit}
            className="flex h-12 items-center gap-3 rounded-lg px-4"
          >
            <div className="flex items-center gap-3">
              <PencilLineIcon className="size-6 text-zinc-900" />
              <Typo.ButtonText size="large">콘텐츠 수정</Typo.ButtonText>
            </div>
          </ButtonV2>
          <ButtonV2
            variant="tertiary"
            onClick={handleDelete}
            className="flex h-12 items-center gap-3 rounded-lg px-4"
          >
            <div className="flex items-center gap-3">
              <Trash2Icon className="size-6 text-red-500" />
              <Typo.ButtonText size="large" className="text-red-500">
                콘텐츠 삭제
              </Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
        <div className="px-5 py-3 pb-[calc(env(safe-area-inset-bottom)+72px)]">
          <ButtonV2 type="button" onClick={onClose} className="w-full" variant="secondary">
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="large">닫기</Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
      </div>
    </>
  );
}

export function MissionIntroPage({
  imageUrl,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
  startDate,
  deadline,
  missionId,
  creatorId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  reward,
  contextTitle,
  bottomButton,
  viewCount,
  likesCount,
}: MissionIntroPageProps) {
  const localTitleRef = useRef<HTMLDivElement>(null);
  const [isTitleHidden, setIsTitleHidden] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isWhiteLabel = pathname.startsWith(`${WHITE_LABEL_PREFIX}/`);
  const { data: currentUser } = useCurrentUser();
  const isOwner = !!currentUser?.id && currentUser.id === creatorId;

  const handleOpenActionSheet = useCallback(() => {
    setIsActionSheetOpen(true);
  }, []);

  useEffect(() => {
    const el = localTitleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isAboveViewport = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        setIsTitleHidden(isAboveViewport);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full">
      {!isWhiteLabel && (
        <div className="sticky top-0 z-50 h-14">
          <div
            className={cn(
              "absolute inset-x-0 top-0 flex h-14 items-center bg-white pl-1 pr-5 transition-opacity duration-300",
              isTitleHidden ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <button
              type="button"
              onClick={() => router.replace(ROUTES.HOME)}
              className="flex items-center justify-center p-3"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <Typo.SubTitle size="large" className="min-w-0 flex-1 truncate">
              {title}
            </Typo.SubTitle>
          </div>
          <div
            className={cn(
              "absolute inset-x-0 top-0 transition-opacity duration-300",
              isTitleHidden ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <ProfileHeader
              showHomeIcon={isOwner}
              fallbackRight={<MissionLoginDrawer />}
              rightExtra={
                isOwner ? (
                  <button
                    type="button"
                    onClick={handleOpenActionSheet}
                    className="flex shrink-0 items-center justify-center p-1"
                  >
                    <EllipsisVerticalIcon className="size-5" />
                  </button>
                ) : undefined
              }
            />
          </div>
        </div>
      )}

      <MissionIntroTemplate
        imageUrl={imageUrl}
        title={title}
        subtitle={subtitle}
        authorName={authorName}
        authorImageUrl={authorImageUrl}
        isRequirePassword={isRequirePassword}
        startDate={startDate}
        deadline={deadline}
        viewCount={viewCount}
        likesCount={likesCount}
        titleRef={localTitleRef}
      >
        <MissionContentTemplate
          title={contextTitle}
          isSticky={false}
          description={description}
          reward={reward}
          missionType={missionType}
          shareButtons={
            <SocialShareButtonsWithData
              missionId={missionId}
              title={missionTitle ?? undefined}
              imageUrl={missionImageUrl ?? undefined}
            />
          }
        />
      </MissionIntroTemplate>

      <FixedBottomLayout.Content>
        <div className="flex items-center gap-2 px-5 py-3">
          {!isWhiteLabel && (
            <MissionLikeButton
              missionId={missionId}
              className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white"
            />
          )}
          <div className="flex-1 [&>div]:p-0">{bottomButton}</div>
        </div>
      </FixedBottomLayout.Content>

      <OwnerActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        missionId={missionId}
      />
    </div>
  );
}
