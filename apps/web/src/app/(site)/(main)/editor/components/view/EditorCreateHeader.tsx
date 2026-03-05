"use client";

import { ROUTES } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { IconButton, Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditorCreateHeader() {
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
      <IconButton icon={ChevronLeft} aria-label="뒤로가기" onClick={handleBack} />
      <Typo.SubTitle className="flex-1">프로젝트 생성</Typo.SubTitle>
    </div>
  );
}
