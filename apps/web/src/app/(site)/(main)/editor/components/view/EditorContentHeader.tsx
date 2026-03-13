"use client";

import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { useReadMission } from "@/hooks/mission";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { IconButton, Typo, useModal } from "@repo/ui/components";
import { ChevronLeft, ExternalLinkIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteMission } from "../../../../me/hooks/useDeleteMission";

function PublishBadge({ missionId }: { missionId: string }) {
  const { data } = useReadMission(missionId);
  const isActive = data?.data?.isActive;

  if (isActive == null) {
    return null;
  }

  return isActive ? (
    <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
      발행됨
    </span>
  ) : (
    <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-500">
      미발행
    </span>
  );
}

function MissionActions({ missionId }: { missionId: string }) {
  const router = useRouter();
  const { showModal } = useModal();
  const deleteMutation = useDeleteMission();

  const handleDelete = () => {
    showModal({
      title: `${UBIQUITOUS_CONSTANTS.MISSION} 삭제`,
      description: `${UBIQUITOUS_CONSTANTS.MISSION}를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다.\n되돌릴 수 없습니다.`,
      confirmText: "삭제하기",
      cancelText: "취소",
      showCancelButton: true,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(missionId);
        router.replace(ROUTES.ME);
      },
    });
  };

  return (
    <>
      <PublishBadge missionId={missionId} />
      <Link
        href={ROUTES.MISSION(missionId)}
        className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 sm:px-3"
        aria-label={`${UBIQUITOUS_CONSTANTS.MISSION} 바로가기`}
      >
        <span className="hidden sm:inline">{UBIQUITOUS_CONSTANTS.MISSION} 바로가기</span>
        <ExternalLinkIcon className="size-3.5" />
      </Link>
      <IconButton
        icon={Trash2Icon}
        aria-label={`${UBIQUITOUS_CONSTANTS.MISSION} 삭제`}
        onClick={handleDelete}
        iconClassName="text-zinc-400 hover:text-red-500"
      />
    </>
  );
}

interface EditorContentHeaderProps {
  missionId?: string;
}

export function EditorContentHeader({ missionId }: EditorContentHeaderProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }
    router.replace(ROUTES.HOME);
  };

  const title = `${UBIQUITOUS_CONSTANTS.MISSION} 에디터`;

  return (
    <div className="flex items-center gap-3">
      {canGoBack ? (
        <IconButton icon={ChevronLeft} aria-label="뒤로가기" onClick={handleBack} />
      ) : (
        <Link href={ROUTES.HOME} className="flex items-center gap-[2.775px] py-3">
          <PolliaIcon className="size-4 text-primary" />
          <PolliaWordmark className="h-[22px] text-black" />
        </Link>
      )}
      <Typo.SubTitle className="flex-1">{title}</Typo.SubTitle>
      {missionId && <MissionActions missionId={missionId} />}
    </div>
  );
}
