import { AdaptiveImage } from "@/components/common/AdaptiveImage";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { ButtonV2, FixedBottomLayout, ProgressBarV3, Typo } from "@repo/ui/components";
import { TiptapViewer } from "@repo/ui/components/common/TiptapViewer";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeftIcon, LightbulbIcon } from "lucide-react";
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { useActionContext } from "./ActionContext";
import { useProgressBar } from "./ProgressBarProvider";

interface ActionTemplateProps extends PropsWithChildren {
  title: string;
  description?: string;
  imageUrl?: string;
  isRequired?: boolean;
  hint?: string;
}

export function SurveyQuestionTemplate({
  title,
  description,
  imageUrl,
  children,
  isRequired,
  hint,
}: ActionTemplateProps) {
  const {
    currentOrder,
    totalActionCount,
    onPrevious,
    onNext,
    onPrefetchNext,
    nextButtonText,
    isLoading,
    isNextDisabled,
    animationName,
  } = useActionContext();

  const contentRef = useRef<HTMLDivElement>(null);
  const { progress, setProgress } = useProgressBar();

  const nextRef = useRef(onNext);
  const canSubmitRef = useRef(false);
  nextRef.current = onNext;
  canSubmitRef.current = !(isRequired && isNextDisabled) && !isLoading;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      if (e.isComposing) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA") return;
      if (!canSubmitRef.current) return;
      e.preventDefault();
      nextRef.current?.();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const progress = ((currentOrder + 1) / totalActionCount) * 100 || 0;
    setProgress(progress);
  }, [currentOrder, totalActionCount, setProgress]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const el = contentRef.current;
    if (el && animationName) {
      el.style.animation = "none";
      el.offsetHeight;
      el.style.animation = `${animationName} 0.25s ease-out`;
    }
  }, [animationName]);

  return (
    <FixedBottomLayout hasGradient>
      <div ref={contentRef} className="space-y-6 px-5 pb-5 pt-[28px]">
        <section className="flex flex-col gap-2 relative">
          <div className="flex items-center justify-between w-full">
            <RequiredIndicator isRequired={!!isRequired} />
            <ProgressBarV3 value={progress} />
          </div>

          <div className="flex flex-col gap-1">
            <Typo.MainTitle size="medium" className="flex gap-1">
              {title}
            </Typo.MainTitle>
            {description && cleanTiptapHTML(description) && (
              <TiptapViewer
                content={cleanTiptapHTML(description)}
                className="prose prose-sm break-keep max-w-none text-sub"
              />
            )}
          </div>

          {imageUrl && <AdaptiveImage src={imageUrl} alt={title} priority />}
        </section>

        {children}

        {hint && <HintToggle hint={hint} />}
      </div>

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
            onMouseEnter={onPrefetchNext}
            onFocus={onPrefetchNext}
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

function HintToggle({ hint }: { hint: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg ring-1 ring-violet-200 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="flex items-center gap-1.5">
          <LightbulbIcon className="size-4 text-violet-500" />
          <Typo.Body size="medium" className="font-semibold text-violet-600">
            힌트
          </Typo.Body>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-violet-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-violet-50 px-4 py-3">
              <Typo.Body size="medium" className="text-violet-700">
                {hint}
              </Typo.Body>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
