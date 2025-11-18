"use client";

import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useReadSurvey } from "@/hooks/survey";
import { useAuth } from "@/hooks/user";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, FloatingButton, Tooltip, Typo } from "@repo/ui/components";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SurveyCollection } from "./components/SurveyCollection";
import { SurveyDescription } from "./components/SurveyDescription";
import { SurveyImage } from "./components/SurveyImage";
import { SurveyLogo } from "./components/SurveyLogo";
import { SurveyReward } from "./components/SurveyReward";

export function SurveyIntro({ initialError }: { initialError: AuthError | null }) {
  const params = useParams<{ id: string }>();
  const { data: survey } = useReadSurvey(params.id);
  const { brandLogoUrl, title, estimatedMinutes, deadline, imageUrl, description, target } =
    survey?.data ?? {};
  const [isRewardVisible, setIsRewardVisible] = useState(true);
  const rewardRef = useRef<HTMLDivElement>(null);

  const scrollToReward = () => {
    rewardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // TODO: 리워드 조회
  // const reward = useReadReward(rewardId);
  const reward = {
    name: "CU 바나나우유 기프티콘",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop",
    description: "설문 완료 후 즉시 제공",
  };

  return (
    <>
      <main className="flex w-full flex-col gap-8 p-5">
        <div className="flex w-full flex-col gap-2">
          <SurveyLogo logoUrl={brandLogoUrl ?? undefined} />

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col gap-2">
              <Typo.MainTitle size="medium">{title}</Typo.MainTitle>

              <SurveyCollection
                deadline={deadline ?? undefined}
                estimatedMinutes={estimatedMinutes ?? undefined}
                target={target ?? undefined}
              />
            </div>
            {imageUrl && <SurveyImage imageUrl={imageUrl} />}
            <SurveyDescription content={description ?? ""} />
          </div>
        </div>

        <div ref={rewardRef}>
          <SurveyReward
            rewardName={reward.name}
            rewardImage={reward.image}
            rewardDescription={reward.description}
            onVisibilityChange={setIsRewardVisible}
          />
        </div>

        <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent px-4 py-3">
          <div
            className={`absolute right-5 top-[-56px] flex flex-col gap-4 transition-opacity duration-150 ${
              !isRewardVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <FloatingButton
              variant="tertiary"
              icon={Gift}
              className="bg-white"
              onClick={scrollToReward}
            />
          </div>
          <BottomButton params={params} initialError={initialError} />
        </FixedBottomLayout.Content>
      </main>
      <div className="flex justify-center">
        <Link
          href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400"
        >
          <Typo.Body size="small">개인정보처리방침</Typo.Body>
        </Link>
      </div>
    </>
  );
}

function BottomButton({
  params,
  initialError,
}: { params: { id: string }; initialError: AuthError | null }) {
  const { handleKakaoLogin } = useKakaoLogin(initialError);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      handleKakaoLogin();
    } else {
      router.push(`/survey/${params.id}/question`);
    }
  };

  return (
    <div data-tooltip-id="tooltip-id" className="w-full">
      <Tooltip id="tooltip-id" placement="top">
        <Typo.Body size="medium">{LOGIN_BUTTON_TEXT.loggedOutTooltip}</Typo.Body>
      </Tooltip>
      <ButtonV2 variant="primary" size="large" className="w-full" onClick={handleClick}>
        <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
          {!isLoggedIn && <KakaoIcon className="size-6" />}
          {isLoggedIn ? LOGIN_BUTTON_TEXT.loggedIn : LOGIN_BUTTON_TEXT.loggedOut}
        </Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}

const LOGIN_BUTTON_TEXT = {
  loggedOutTooltip: "로그인 후 리워드를 받아보세요 🎁",
  loggedIn: "참여하고 리워드 받기",
  loggedOut: "카카오 로그인 후 참여하기",
};
