"use client";

import { NavigableProfileHeader } from "@/components/common/NavigableProfileHeader";
import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { usePathname, useRouter } from "next/navigation";
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

function RewardClaimButton() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { handleKakaoLogin } = useKakaoLogin({ redirectPath: pathname });

  const handleClaimReward = () => {
    router.push(ROUTES.ME_REWARDS_PENDING);
  };

  return (
    <FixedBottomLayout hasGradientBlur>
      <FixedBottomLayout.Content className="px-5 py-3">
        <ButtonV2
          variant="primary"
          className="w-full"
          onClick={isLoggedIn ? handleClaimReward : handleKakaoLogin}
        >
          <div className="flex items-center justify-center w-full gap-6">
            {!isLoggedIn && <KakaoIcon />}
            <Typo.ButtonText size="large">
              {isLoggedIn ? "🎁 리워드 바로 받기" : "로그인하고 리워드 받기"}
            </Typo.ButtonText>
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
      <FixedBottomLayout.Content className="px-0">
        {hasReward && <RewardClaimButton />}
      </FixedBottomLayout.Content>
    </div>
  );
}
