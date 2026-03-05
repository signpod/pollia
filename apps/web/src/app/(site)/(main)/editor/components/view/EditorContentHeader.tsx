"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { IconButton, Typo, useModal } from "@repo/ui/components";
import { ChevronLeft, ExternalLinkIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteMission } from "../../../../me/hooks/useDeleteMission";

function MissionActions({ missionId }: { missionId: string }) {
  const router = useRouter();
  const { showModal } = useModal();
  const deleteMutation = useDeleteMission();

  const handleDelete = () => {
    showModal({
      title: "콘텐츠 삭제",
      description:
        "콘텐츠를 삭제하면 참여자들의 응답 데이터도 함께 삭제됩니다.\n되돌릴 수 없습니다.",
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
      <Link
        href={ROUTES.MISSION(missionId)}
        className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
      >
        프로젝트 바로가기
        <ExternalLinkIcon className="size-3.5" />
      </Link>
      <IconButton
        icon={Trash2Icon}
        aria-label="프로젝트 삭제"
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

  const title = "프로젝트 에디터";

  return (
    <div className="flex items-center gap-3">
      <IconButton icon={ChevronLeft} aria-label="뒤로가기" onClick={handleBack} />
      <Typo.SubTitle className="flex-1">{title}</Typo.SubTitle>
      {missionId && <MissionActions missionId={missionId} />}
    </div>
  );
}
