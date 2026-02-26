"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditorMissionHeaderProps {
  title: string;
}

export function EditorMissionHeader({ title }: EditorMissionHeaderProps) {
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
      <Typo.SubTitle>{title}</Typo.SubTitle>
    </div>
  );
}
