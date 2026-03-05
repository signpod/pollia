"use client";

import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MissionCompletionTemplate } from "../templates/MissionCompletionTemplate";

export interface MissionCompletionPageProps {
  imageUrl?: string | null;
  missionTitle?: string | null;
  title?: string;
  description?: string;
  reward?: ReactNode;
  shareButtons?: ReactNode;
  hasReward?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

function RewardBottomSheet({
  isOpen,
  onClose,
  onGoHome,
  onGoRewards,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onGoRewards: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className="relative w-full max-w-[600px]"
            onClick={e => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          >
            <div className="rounded-t-2xl bg-white shadow-[0px_4px_20px_0px_rgba(9,9,11,0.16)]">
              <div className="flex flex-col items-center gap-2 p-5">
                <Typo.MainTitle size="small">리워드 지급이 접수되었어요</Typo.MainTitle>
                <Typo.Body size="medium" className="text-center text-zinc-500 whitespace-pre-line">
                  {
                    "리워드는 안내에 따라 검수 후 지급될 예정이에요\n자세한 내역은 마이페이지 > 리워드에서\n확인할 수 있어요"
                  }
                </Typo.Body>
              </div>
              <div className="flex gap-2 px-5 py-3">
                <ButtonV2 variant="secondary" className="flex-1" onClick={onGoHome}>
                  <div className="flex items-center justify-center w-full">
                    <Typo.ButtonText size="large">닫기</Typo.ButtonText>
                  </div>
                </ButtonV2>
                <ButtonV2 variant="primary" className="flex-1" onClick={onGoRewards}>
                  <div className="flex items-center justify-center w-full">
                    <Typo.ButtonText size="large">첫 화면으로</Typo.ButtonText>
                  </div>
                </ButtonV2>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function CompletionBottomButton({ hasReward }: { hasReward: boolean }) {
  const { isLoggedIn } = useAuth();
  const { missionId } = useParams<{ missionId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { handleKakaoLogin } = useKakaoLogin({ redirectPath: pathname });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <FixedBottomLayout hasGradientBlur hasBottomGap={false}>
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
      </FixedBottomLayout>
    );
  }

  if (hasReward) {
    return (
      <>
        <FixedBottomLayout hasGradientBlur hasBottomGap={false}>
          <FixedBottomLayout.Content className="px-5 py-3">
            <ButtonV2 variant="primary" className="w-full" onClick={() => setIsSheetOpen(true)}>
              <div className="flex items-center justify-center w-full">
                <Typo.ButtonText size="large">🎁 리워드 받기</Typo.ButtonText>
              </div>
            </ButtonV2>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>

        <RewardBottomSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onGoHome={() => setIsSheetOpen(false)}
          onGoRewards={() => router.push(ROUTES.MISSION(missionId))}
        />
      </>
    );
  }

  return (
    <FixedBottomLayout hasGradientBlur hasBottomGap={false}>
      <FixedBottomLayout.Content className="px-5 py-3">
        <div className="flex gap-2 w-full">
          <ButtonV2 variant="secondary" className="flex-1" onClick={() => router.push(ROUTES.HOME)}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="large">홈으로 가기</Typo.ButtonText>
            </div>
          </ButtonV2>
          <ButtonV2
            variant="primary"
            className="flex-1"
            onClick={() => router.push(ROUTES.ME_COMPLETED_TAB)}
          >
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="large">마이페이지</Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}

export function MissionCompletionPage({
  imageUrl,
  missionTitle,
  title,
  description,
  reward,
  shareButtons,
  hasReward,
  onSave,
  isSaving,
  canSave,
}: MissionCompletionPageProps) {
  const router = useRouter();

  const header = (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-white px-1">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center justify-center p-3"
      >
        <ChevronLeft className="size-6" />
      </button>
      {canSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center justify-center p-3"
        >
          <Typo.Body size="medium" className="text-sub">
            {isSaving ? "저장 중..." : "저장하기"}
          </Typo.Body>
        </button>
      )}
    </header>
  );

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
      />
      <CompletionBottomButton hasReward={!!hasReward} />
    </div>
  );
}
