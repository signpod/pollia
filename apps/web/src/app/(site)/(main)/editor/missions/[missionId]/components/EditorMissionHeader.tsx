"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { Typo } from "@repo/ui/components";
import { ChevronLeft, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditorMissionHeaderProps {
  title: string;
  missionId: string;
}

export function EditorMissionHeader({ title, missionId }: EditorMissionHeaderProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }

    router.replace(ROUTES.HOME);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="flex size-8 items-center justify-center rounded-full text-zinc-700"
      >
        <ChevronLeft className="size-5" />
      </button>
      <Typo.SubTitle className="flex-1">{title}</Typo.SubTitle>
      <Link
        href={ROUTES.MISSION(missionId)}
        className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
      >
        프로젝트 바로가기
        <ExternalLinkIcon className="size-3.5" />
      </Link>
    </div>
  );
}
