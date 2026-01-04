import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import { type PropsWithChildren, useEffect, useState } from "react";
import { useProgressBar } from "../providers/ProgressBarProvider";

interface ActionTemplateProps extends PropsWithChildren {
  currentOrder: number;
  totalActionCount: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isFirstAction: boolean;
  isNextDisabled: boolean;
  isRequired?: boolean;
  onPrevious?: () => void;
  onNext?: () => void | Promise<void>;
  nextButtonText?: string;
  isLoading?: boolean;
}

export function SurveyQuestionTemplate({
  currentOrder,
  totalActionCount,
  title,
  description,
  imageUrl,
  children,
  isNextDisabled,
  isRequired,
  onPrevious,
  onNext,
  nextButtonText = "다음",
  isLoading,
}: ActionTemplateProps) {
  const progressValue = ((currentOrder + 1) / totalActionCount) * 100 || 0;
  const { setProgress } = useProgressBar();
  const [showRequiredError, setShowRequiredError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setProgress(progressValue, currentOrder + 1, totalActionCount);
  }, [currentOrder, totalActionCount, progressValue, setProgress]);

  useEffect(() => {
    if (!isNextDisabled) {
      setShowRequiredError(false);
    }
  }, [isNextDisabled]);

  const handleDisabledButtonClick = () => {
    if (isNextDisabled && isRequired) {
      setShowRequiredError(true);
    }
  };

  return (
    <FixedBottomLayout hasGradient>
      <div className="space-y-8 px-5 pb-5 pt-9">
        {/* 질문 정보 섹션 */}
        <section className="space-y-2 relative">
          <Typo.MainTitle size="medium" className="flex gap-1">
            {title}
            {isRequired && <span className="text-red-500">*</span>}
          </Typo.MainTitle>

          {description && (
            <Typo.Body size="large" className="text-sub">
              {description}
            </Typo.Body>
          )}
          {showRequiredError && (
            <Typo.Body size="medium" className="text-red-500 absolute top-full">
              필수 입력 사항이에요.
            </Typo.Body>
          )}

          {imageUrl && (
            <figure className="relative aspect-3/2 overflow-hidden rounded-sm">
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
          <div className="flex-1" onClick={handleDisabledButtonClick}>
            <ButtonV2
              variant="primary"
              size="large"
              className="w-full flex"
              disabled={isRequired && isNextDisabled}
              loading={isLoading}
              onClick={async () => {
                if (onNext instanceof Promise) {
                  await onNext();
                } else {
                  onNext?.();
                }
              }}
            >
              <Typo.ButtonText size="large" className="flex justify-center w-full">
                {nextButtonText}
              </Typo.ButtonText>
            </ButtonV2>
          </div>
        </nav>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
