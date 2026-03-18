"use client";

import { LoginDrawer } from "@/app/(site)/(main)/components/LoginDrawer";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import {
  ButtonV2,
  DrawerContent,
  DrawerProvider,
  FixedBottomLayout,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { MissionCompletionTemplate } from "../templates/MissionCompletionTemplate";

export interface MissionCompletionPageProps {
  imageUrl?: string | null;
  missionTitle?: string | null;
  title?: string;
  description?: string;
  reward?: ReactNode;
  shareButtons?: ReactNode;
  recommendation?: ReactNode;
  completionLinks?: ReactNode;
  purchaseLinks?: ReactNode;
  hasReward?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  showBottomButton?: boolean;
  showHeader?: boolean;
}

function RewardDrawerContent({ onClose }: { onClose: () => void }) {
  const { close } = useDrawer();

  const handleClose = () => {
    close();
    onClose();
  };

  return (
    <DrawerContent className="rounded-t-2xl shadow-[0px_4px_20px_0px_rgba(9,9,11,0.16)]">
      <div className="flex flex-col items-center gap-1 pt-8 px-5 pb-5">
        <Typo.MainTitle size="small">리워드 지급이 접수되었어요</Typo.MainTitle>
        <Typo.Body size="large" className="text-center text-zinc-500 whitespace-pre-line">
          {
            "리워드는 안내에 따라 검수 후 지급될 예정이에요\n자세한 내역은 마이페이지 > 리워드에서\n확인할 수 있어요"
          }
        </Typo.Body>
      </div>
      <div className="px-5 py-3">
        <ButtonV2 variant="secondary" className="w-full" onClick={handleClose}>
          <div className="flex items-center justify-center w-full">
            <Typo.ButtonText size="large">닫기</Typo.ButtonText>
          </div>
        </ButtonV2>
      </div>
    </DrawerContent>
  );
}

function copyCurrentUrl() {
  navigator.clipboard.writeText(window.location.href);
  toast.success("링크가 복사되었어요");
}

function CompletionBottomButton({
  hasReward,
  onShare,
}: {
  hasReward: boolean;
  onShare?: () => void;
}) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { handleKakaoLogin } = useKakaoLogin({ redirectPath: pathname });
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);

  if (!isLoggedIn) {
    return (
      <FixedBottomLayout.Content className="px-5 py-3">
        <ButtonV2
          variant="primary"
          className="w-full bg-kakao hover:bg-kakao active:bg-kakao focus:bg-kakao"
          onClick={handleKakaoLogin}
        >
          <div className="flex items-center justify-center w-full gap-6 text-default">
            <KakaoIcon className="size-6" />
            <Typo.ButtonText size="large">
              {hasReward ? "로그인하고 리워드 받기" : "로그인하고 결과 저장하기"}
            </Typo.ButtonText>
          </div>
        </ButtonV2>
      </FixedBottomLayout.Content>
    );
  }

  if (hasReward && !isRewardClaimed) {
    return (
      <FixedBottomLayout.Content className="px-5 py-3">
        <DrawerProvider>
          <div className="flex gap-2 w-full">
            <RewardButtonTrigger />
            <ButtonV2
              variant="primary"
              className="flex-1"
              onClick={() => {
                copyCurrentUrl();
                onShare?.();
              }}
            >
              <div className="flex items-center justify-center w-full">
                <Typo.ButtonText size="large">결과 공유하기</Typo.ButtonText>
              </div>
            </ButtonV2>
          </div>
          <RewardDrawerContent onClose={() => setIsRewardClaimed(true)} />
        </DrawerProvider>
      </FixedBottomLayout.Content>
    );
  }

  return (
    <FixedBottomLayout.Content className="px-5 py-3">
      <div className="flex gap-2 w-full">
        <ButtonV2 variant="secondary" className="flex-1" onClick={() => router.push(ROUTES.HOME)}>
          <div className="flex items-center justify-center w-full">
            <Typo.ButtonText size="large">처음으로</Typo.ButtonText>
          </div>
        </ButtonV2>
        <ButtonV2
          variant="primary"
          className="flex-1"
          onClick={() => {
            copyCurrentUrl();
            onShare?.();
          }}
        >
          <div className="flex items-center justify-center w-full">
            <Typo.ButtonText size="large">결과 공유하기</Typo.ButtonText>
          </div>
        </ButtonV2>
      </div>
    </FixedBottomLayout.Content>
  );
}

function RewardButtonTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2 variant="secondary" className="flex-1" onClick={open}>
      <div className="flex items-center justify-center w-full">
        <Typo.ButtonText size="large">🎁 리워드 받기</Typo.ButtonText>
      </div>
    </ButtonV2>
  );
}

function CompletionLoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2
      variant="tertiary"
      size="medium"
      onClick={open}
      className="text-sub border border-default"
    >
      <Typo.ButtonText size="medium">로그인/가입</Typo.ButtonText>
    </ButtonV2>
  );
}

function CompletionLoginDrawer() {
  return (
    <LoginDrawer>
      <CompletionLoginDrawerTrigger />
    </LoginDrawer>
  );
}

export function MissionCompletionPage({
  imageUrl,
  missionTitle,
  title,
  description,
  reward,
  shareButtons,
  recommendation,
  completionLinks,
  purchaseLinks,
  hasReward,
  onSave,
  onShare,
  isSaving,
  canSave,
  showBottomButton = true,
  showHeader = true,
}: MissionCompletionPageProps) {
  const header = showHeader ? (
    <ProfileHeader showHomeIcon fallbackRight={<CompletionLoginDrawer />} />
  ) : undefined;

  return (
    <div className="relative flex w-full flex-col items-center">
      <MissionCompletionTemplate
        header={header}
        imageUrl={imageUrl}
        missionTitle={missionTitle}
        title={title}
        description={description}
        reward={reward}
        shareButtons={shareButtons}
        recommendation={recommendation}
        completionLinks={completionLinks}
        purchaseLinks={purchaseLinks}
        onSave={onSave}
        isSaving={isSaving}
        canSave={canSave}
      />
      {showBottomButton && <CompletionBottomButton hasReward={!!hasReward} onShare={onShare} />}
    </div>
  );
}
