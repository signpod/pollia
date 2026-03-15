"use client";

import { updateMission } from "@/actions/mission/update";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { useReadMission } from "@/hooks/mission";
import { MissionType } from "@prisma/client";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Typo,
  toast,
  useModal,
} from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, ChevronLeft, ExternalLinkIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteMission } from "../../../../me/hooks/useDeleteMission";

type MissionVisibility = "public" | "linkOnly" | "private";

const VISIBILITY_CONFIG = {
  public: {
    label: "전체 공개",
    description: "폴리아 메인 피드에 공개가 되어요.",
    badgeClassName: "bg-green-100 text-green-700",
  },
  linkOnly: {
    label: "링크만 공개",
    description: "주소로만 들어올 수 있어요.",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  private: {
    label: "나만 보기",
    description: "작성자 본인만 들어올 수 있어요.",
    badgeClassName: "bg-zinc-100 text-zinc-500",
  },
} as const;

function resolveVisibility(isActive: boolean, type: MissionType): MissionVisibility {
  if (!isActive) return "private";
  return type === MissionType.GENERAL ? "public" : "linkOnly";
}

function VisibilityDropdown({ missionId }: { missionId: string }) {
  const { data, isLoading } = useReadMission(missionId);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading || isUpdating) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
        {"\u200b"}
        <span className="flex items-center gap-0.5">
          <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
          <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
          <span className="size-1 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
        </span>
      </span>
    );
  }

  const mission = data?.data;
  if (!mission || mission.isActive == null) {
    return null;
  }

  const current = resolveVisibility(mission.isActive, mission.type);
  const config = VISIBILITY_CONFIG[current];

  const handleSelect = async (next: MissionVisibility) => {
    if (next === current || isUpdating) return;
    setIsUpdating(true);
    setOpen(false);

    try {
      switch (next) {
        case "public":
          await updateMission(missionId, { isActive: true, type: MissionType.GENERAL });
          break;
        case "linkOnly":
          await updateMission(missionId, { isActive: true, type: MissionType.EXPERIENCE_GROUP });
          break;
        case "private":
          await updateMission(missionId, { isActive: false });
          break;
      }
      void queryClient.invalidateQueries({ queryKey: missionQueryKeys.mission(missionId) });
      toast({ message: `${VISIBILITY_CONFIG[next].label}(으)로 변경되었습니다.` });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "공개 상태 변경 중 오류가 발생했습니다.";
      toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${config.badgeClassName}`}
          disabled={isUpdating}
        >
          {config.label}
          <ChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 bg-white p-1 shadow-lg">
        {(
          Object.entries(VISIBILITY_CONFIG) as [
            MissionVisibility,
            (typeof VISIBILITY_CONFIG)[MissionVisibility],
          ][]
        ).map(([key, value]) => (
          <button
            key={key}
            type="button"
            className={`flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-zinc-100 ${current === key ? "bg-zinc-50" : ""}`}
            onClick={() => void handleSelect(key)}
            disabled={isUpdating}
          >
            <span className="text-sm font-medium text-zinc-900">{value.label}</span>
            <span className="text-xs text-zinc-500">{value.description}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
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
      <VisibilityDropdown missionId={missionId} />
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
