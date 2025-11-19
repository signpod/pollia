import { toast } from "@/components/common/Toast";
import { SURVEY_TOAST_MESSAGE } from "@/constants/surveyMessages";
import {
  ButtonV2,
  FixedBottomLayout,
  FixedTopLayout,
  ProgressBar,
  Typo,
} from "@repo/ui/components";
import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import { type PropsWithChildren, useEffect } from "react";

let hasShownFirstToast = false;
let hasShownHalfToast = false;
let hasShownFinalToast = false;

interface SurveyQuestionTemplateProps extends PropsWithChildren {
  currentOrder: number;
  totalQuestionCount: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isFirstQuestion: boolean;
  isNextDisabled: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
}

export function SurveyQuestionTemplate({
  currentOrder,
  totalQuestionCount,
  title,
  description,
  imageUrl,
  children,
  isNextDisabled,
  onPrevious,
  onNext,
  nextButtonText = "다음",
}: SurveyQuestionTemplateProps) {
  const progressValue = (currentOrder / totalQuestionCount) * 100 || 0;

  useEffect(() => {
    const isFirstQuestion = currentOrder === 1 && !hasShownFirstToast;
    const isFinalQuestion = currentOrder === totalQuestionCount && !hasShownFinalToast;
    const isHalfway = progressValue >= 50 && !hasShownHalfToast;

    if (isFirstQuestion) {
      toast.default(SURVEY_TOAST_MESSAGE.first.message, { id: SURVEY_TOAST_MESSAGE.first.id });
      hasShownFirstToast = true;
      return;
    }

    if (isFinalQuestion) {
      toast.default(SURVEY_TOAST_MESSAGE.final.message, { id: SURVEY_TOAST_MESSAGE.final.id });
      hasShownFinalToast = true;
      return;
    }

    if (isHalfway) {
      toast.default(SURVEY_TOAST_MESSAGE.half.message, { id: SURVEY_TOAST_MESSAGE.half.id });
      hasShownHalfToast = true;
    }
  }, [currentOrder, totalQuestionCount, progressValue]);

  return (
    <FixedBottomLayout>
      <FixedTopLayout>
        <FixedTopLayout.Content className="pt-3">
          <ProgressBar value={progressValue} />
        </FixedTopLayout.Content>
      </FixedTopLayout>

      <div className="space-y-8 mt-8 px-5 pb-5">
        {/* 질문 정보 섹션 */}
        <section className="pt-5 space-y-2">
          <Typo.MainTitle size="medium">{title}</Typo.MainTitle>
          {description && (
            <Typo.Body size="large" className="text-sub">
              {description}
            </Typo.Body>
          )}
          {imageUrl && (
            <figure className="relative aspect-[3/2] overflow-hidden rounded-sm">
              <Image src={imageUrl} alt={title} fill className="object-cover" />
            </figure>
          )}
        </section>

        {/* 질문 입력 영역 (children) */}
        {children}
      </div>

      {/* 네비게이션 버튼 */}
      <FixedBottomLayout.Content className="px-5 py-3">
        <nav className="flex gap-2">
          <ButtonV2
            variant="secondary"
            size="large"
            className="w-fit aspect-square"
            onClick={onPrevious}
          >
            <ChevronLeftIcon className="size-6" />
          </ButtonV2>
          <ButtonV2
            variant="primary"
            size="large"
            className="flex-1 flex"
            disabled={isNextDisabled}
            onClick={onNext}
          >
            <Typo.ButtonText size="large" className="flex justify-center w-full">
              {nextButtonText}
            </Typo.ButtonText>
          </ButtonV2>
        </nav>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
