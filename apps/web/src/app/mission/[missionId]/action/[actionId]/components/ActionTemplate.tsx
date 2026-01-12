import { cleanTiptapHTML, cn } from "@/lib/utils";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import { type PropsWithChildren, useEffect } from "react";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setProgress(progressValue, currentOrder + 1, totalActionCount);
  }, [currentOrder, totalActionCount, progressValue, setProgress]);

  return (
    <FixedBottomLayout hasGradient>
      <div className="space-y-6 px-5 pb-5 pt-[28px]">
        {/* 질문 정보 섹션 */}
        <section className="space-y-2 relative">
          <RequiredIndicator isRequired={!!isRequired} />
          <Typo.MainTitle size="medium" className="flex gap-1">
            {title}
          </Typo.MainTitle>

          {description && cleanTiptapHTML(description) && (
            <TiptapViewer
              content={cleanTiptapHTML(description)}
              className="prose prose-sm break-keep max-w-none text-sub"
            />
          )}

          {imageUrl && (
            <figure className="relative aspect-3/2 overflow-hidden rounded-sm">
              <Image src={imageUrl} alt={title} fill className="object-contain h-full" />
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
        </nav>
      </FixedBottomLayout.Content>
    </FixedBottomLayout>
  );
}

interface RequiredIndicatorProps {
  isRequired: boolean;
}

const REQUIRED_TEXT_LABELS = {
  required: "필수 답변",
  optional: "선택 답변",
} as const;

function RequiredIndicator({ isRequired }: RequiredIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[6px] px-2 py-1 w-fit",
        isRequired ? "bg-point" : "bg-white ring-1 ring-default",
      )}
    >
      <Typo.Body size="small" className={cn(isRequired ? "text-point" : "text-info")}>
        {isRequired ? REQUIRED_TEXT_LABELS.required : REQUIRED_TEXT_LABELS.optional}
      </Typo.Body>
    </div>
  );
}
