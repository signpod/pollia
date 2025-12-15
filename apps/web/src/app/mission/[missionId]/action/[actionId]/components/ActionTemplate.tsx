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

interface ActionTemplateProps extends PropsWithChildren {
  currentOrder: number;
  totalActionCount: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isFirstAction: boolean;
  isNextDisabled: boolean;
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
  onPrevious,
  onNext,
  nextButtonText = "다음",
  isLoading,
}: ActionTemplateProps) {
  const progressValue = ((currentOrder + 1) / totalActionCount) * 100 || 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <FixedBottomLayout hasGradient>
      <FixedTopLayout>
        <FixedTopLayout.Content className="pt-3">
          <ProgressBar value={progressValue} />
        </FixedTopLayout.Content>
      </FixedTopLayout>

      <div className="space-y-8 px-5 pb-5 pt-9">
        {/* 질문 정보 섹션 */}
        <section className="space-y-2">
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
        </nav>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}
