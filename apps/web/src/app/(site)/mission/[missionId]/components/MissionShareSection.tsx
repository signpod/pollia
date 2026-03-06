import { Typo } from "@repo/ui/components";
import type { ReactNode } from "react";

interface MissionShareSectionProps {
  shareButtons: ReactNode;
}

export function MissionShareSection({ shareButtons }: MissionShareSectionProps) {
  return (
    <div className="bg-zinc-50 rounded-xl p-3 flex items-center w-full justify-between">
      <Typo.SubTitle size="large">🔗 콘텐츠를 공유해보세요</Typo.SubTitle>
      {shareButtons}
    </div>
  );
}
