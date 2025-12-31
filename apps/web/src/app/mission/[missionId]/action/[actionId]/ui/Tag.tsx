import { toast } from "@/components/common/Toast";
import { ActionStepContentProps } from "@/constants/action";
import { useIsMobile } from "@/hooks/common/useIsMobile";
import { ActionType } from "@/types/domain/action";
import { BottomDrawer, Typo, useBottomDrawer } from "@repo/ui/components";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { Chip } from "./Chip";
import { MultipleChoiceProvider, useSurveyMultipleChoice } from "./MultipleChoiceProvider";

export function ActionTag({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  return (
    <MultipleChoiceProvider
      maxSelections={actionData.maxSelections ?? 1}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
      answerType={ActionType.TAG}
    >
      <SurveyMultipleChoiceContent
        actionData={actionData}
        currentOrder={currentOrder}
        totalActionCount={totalActionCount}
        isFirstAction={isFirstAction}
        isNextDisabled={isNextDisabled}
        onPrevious={onPrevious}
        onNext={onNext}
        nextButtonText={nextButtonText}
        isLoading={isLoading}
      />
    </MultipleChoiceProvider>
  );
}

function SurveyMultipleChoiceContent({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  isLoading,
}: Omit<ActionStepContentProps, "updateCanGoNext" | "onAnswerChange">) {
  const { selectedIds, toggleSelectedId, canGoNext } = useSurveyMultipleChoice();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState<number>(400);

  const isDisabled =
    actionData.maxSelections !== null && selectedIds.size >= actionData.maxSelections;

  const handleClick = (optionId: string) => {
    const isSingleSelection = actionData.maxSelections === 1;
    const isAtMaxAndSelectingNew =
      isDisabled && !selectedIds.has(optionId) && actionData.maxSelections !== null;

    if (!isSingleSelection && isAtMaxAndSelectingNew) {
      toast.default(`최대 ${actionData.maxSelections}개까지 선택할 수 있어요.`);
      return;
    }
    toggleSelectedId(optionId);
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const getViewportHeight = () => {
      if (window.visualViewport) {
        return window.visualViewport.height;
      }
      return document.documentElement.clientHeight || window.innerHeight;
    };

    const updateHeight = () => {
      if (contentRef.current) {
        const children = contentRef.current.children;
        if (children.length > 0) {
          const firstChild = children[0] as HTMLElement;
          const firstChildRect = firstChild.getBoundingClientRect();
          const firstChildY = firstChildRect.top;

          const viewportHeight = getViewportHeight();
          const calculatedHeight = viewportHeight - firstChildY;
          const maxHeight = viewportHeight * 0.9;
          setExpandedHeight(Math.min(calculatedHeight, maxHeight));
        }
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
      return () => {
        resizeObserver.disconnect();
        window.visualViewport?.removeEventListener("resize", updateHeight);
      };
    }

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.options]);

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || !canGoNext}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
    >
      <div ref={contentRef} className="flex flex-wrap gap-3 w-full">
        {actionData.options?.map(option => (
          <Chip
            key={option.id}
            label={option.title}
            isSelected={selectedIds.has(option.id)}
            onClick={() => handleClick(option.id)}
          />
        ))}
      </div>
      <BottomDrawer collapsedHeight={146} expandedHeight={expandedHeight}>
        <BottomDrawerContentWithScrollReset
          actionData={actionData}
          selectedIds={selectedIds}
          handleClick={handleClick}
        />
      </BottomDrawer>
    </SurveyQuestionTemplate>
  );
}

function BottomDrawerContentWithScrollReset({
  actionData,
  selectedIds,
  handleClick,
}: {
  actionData: ActionStepContentProps["actionData"];
  selectedIds: Set<string>;
  handleClick: (optionId: string) => void;
}) {
  const { isOpen, toggle } = useBottomDrawer();
  const bodyRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const selectedOptions = actionData?.options?.filter(option => selectedIds.has(option.id));

  return (
    <BottomDrawer.Content
      className="ring-1 ring-default shadow-[0_-4px_20px_0px_rgba(9,9,11,0.08)]"
      clickToExpand={!isMobile}
      enableDrag={isMobile}
    >
      <BottomDrawer.Header
        showToggleButton={false}
        showCloseButton={false}
        onClick={toggle}
        className="relative h-[74px] py-0 px-5"
      >
        <div className="flex flex-col gap-4 items-center w-full h-full">
          <div className="flex items-center justify-center h-5">
            <div className="h-1 rounded-3xl bg-zinc-300 w-9" />
          </div>

          <div className="flex items-center justify-between w-full">
            <Typo.SubTitle size="large">선택된 항목</Typo.SubTitle>
            <Typo.SubTitle size="large">{selectedOptions?.length}개</Typo.SubTitle>
          </div>
        </div>
      </BottomDrawer.Header>
      <BottomDrawer.Body>
        <div ref={bodyRef} className="flex flex-wrap gap-3 w-full pb-[80px]">
          {selectedOptions?.map(option => (
            <Chip
              key={option.id}
              label={option.title}
              isSelected={selectedIds.has(option.id)}
              onClick={() => handleClick(option.id)}
            />
          ))}
        </div>
      </BottomDrawer.Body>
    </BottomDrawer.Content>
  );
}
