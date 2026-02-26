"use client";

import { NavigableProfileHeader } from "@/components/common/NavigableProfileHeader";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { usePathname } from "next/navigation";
import type { ReactNode, RefObject } from "react";
import { MissionCompletionTemplate } from "../templates/MissionCompletionTemplate";

export interface MissionCompletionPageProps {
  header?: ReactNode;
  imageUrl?: string | null;
  title?: string;
  description?: string;
  reward?: ReactNode;
  shareButtons?: ReactNode;
  hasReward?: boolean;

  imageMenu?: {
    isOpen: boolean;
    menuRef: RefObject<HTMLDivElement | null>;
    onToggle: () => void;
    onSave: () => void;
    onShare: () => void;
  };
}

function RewardClaimButton({ hasReward }: { hasReward: boolean }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const { handleKakaoLogin } = useKakaoLogin({ redirectPath: pathname });

  if (isLoggedIn || !hasReward) return null;

  return (
    <FixedBottomLayout hasGradientBlur>
      <FixedBottomLayout.Content className="px-5 py-3">
        <ButtonV2
          variant="primary"
          className="w-full bg-kakao hover:bg-kakao active:bg-kakao focus:bg-kakao"
          onClick={handleKakaoLogin}
        >
          <div className="flex items-center justify-center w-full gap-6 text-default">
            <KakaoIcon className="size-6" />
            <Typo.ButtonText size="large">로그인하고 리워드 받기</Typo.ButtonText>
          </div>
        </ButtonV2>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}

export function MissionCompletionPage({
  header = <NavigableProfileHeader />,
  imageUrl,
  title,
  description,
  reward,
  shareButtons,
  hasReward,
  imageMenu,
}: MissionCompletionPageProps) {
  return (
    <div className="relative flex w-full flex-col items-center bg-red-600 h-auto">
      <MissionCompletionTemplate
        header={header}
        imageUrl={imageUrl}
        title={title}
        description={description}
        reward={reward}
        shareButtons={shareButtons}
        imageMenu={imageMenu}
      />
      {hasReward && <RewardClaimButton hasReward={hasReward} />}
    </div>
  );
}
