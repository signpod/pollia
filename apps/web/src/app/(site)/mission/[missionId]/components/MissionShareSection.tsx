import { Typo } from "@repo/ui/components";
import type { ReactNode } from "react";

interface MissionShareSectionProps {
  shareButtons: ReactNode;
}

export function MissionShareSection({ shareButtons }: MissionShareSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-0 w-full justify-between">
      <Typo.SubTitle size="large" className="shrink-0">
        가족, 친구에게
        <br />
        공유해보세요
      </Typo.SubTitle>
      {shareButtons}
    </div>
  );
}
