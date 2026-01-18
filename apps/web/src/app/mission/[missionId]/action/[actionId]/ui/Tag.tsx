import { toast } from "@/components/common/Toast";
import { ActionStepContentProps, CLIENT_OTHER_OPTION_ID } from "@/constants/action";
import { useIsMobile } from "@/hooks/common/useIsMobile";
import { ActionType } from "@/types/domain/action";
import { BottomDrawer, Typo, useBottomDrawer } from "@repo/ui/components";
import { X } from "lucide-react";
import { useState } from "react";
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
  const { selectedIds, toggleSelectedId, canGoNext, textAnswer, setTextAnswer, isOtherSelected } =
    useSurveyMultipleChoice();

  const [showOtherError, setShowOtherError] = useState(false);

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

  const handleOtherClick = () => {
    const isSingleSelection = actionData.maxSelections === 1;
    const isAtMaxAndSelectingNew =
      isDisabled && !isOtherSelected && actionData.maxSelections !== null;

    if (!isSingleSelection && isAtMaxAndSelectingNew) {
      toast.default(`최대 ${actionData.maxSelections}개까지 선택할 수 있어요.`);
      return;
    }
    toggleSelectedId(CLIENT_OTHER_OPTION_ID);
    if (isOtherSelected) {
      setTextAnswer("");
      setShowOtherError(false);
    }
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswer(e.target.value);
    if (e.target.value.trim()) {
      setShowOtherError(false);
    }
  };

  const handleTextAnswerBlur = () => {
    if (isOtherSelected && !textAnswer.trim()) {
      setShowOtherError(true);
    }
  };

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
      isRequired={actionData.isRequired}
    >
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-wrap gap-3">
          {actionData.options?.map(option => (
            <Chip
              key={option.id}
              label={option.title}
              isSelected={selectedIds.has(option.id)}
              onClick={() => handleClick(option.id)}
            />
          ))}
        </div>
        {actionData.hasOther && (
          <Chip
            label="기타(직접 입력)"
            isSelected={isOtherSelected}
            isOther
            textValue={textAnswer}
            onTextChange={handleTextAnswerChange}
            onTextBlur={handleTextAnswerBlur}
            onClick={handleOtherClick}
            showError={showOtherError}
          />
        )}
      </div>
      <BottomDrawer collapsedHeight={120} expandedHeight={180}>
        <BottomDrawerContentWithScrollReset
          actionData={actionData}
          selectedIds={selectedIds}
          handleClick={handleClick}
          isOtherSelected={isOtherSelected}
          textAnswer={textAnswer}
          onOtherClick={handleOtherClick}
        />
      </BottomDrawer>
    </SurveyQuestionTemplate>
  );
}

function BottomDrawerContentWithScrollReset({
  actionData,
  selectedIds,
  handleClick,
  isOtherSelected,
  textAnswer,
  onOtherClick,
}: {
  actionData: ActionStepContentProps["actionData"];
  selectedIds: Set<string>;
  handleClick: (optionId: string) => void;
  isOtherSelected: boolean;
  textAnswer: string;
  onOtherClick: () => void;
}) {
  const { toggle } = useBottomDrawer();
  const isMobile = useIsMobile();

  const handleHeaderClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    toggle();
  };

  const selectedOptions = actionData?.options?.filter(option => selectedIds.has(option.id));
  const totalSelectedCount = (selectedOptions?.length ?? 0) + (isOtherSelected ? 1 : 0);

  return (
    <BottomDrawer.Content
      className="ring-1 ring-default shadow-[0_-4px_20px_0px_rgba(9,9,11,0.08)]"
      clickToExpand={!isMobile}
      enableDrag={isMobile}
    >
      <BottomDrawer.Header
        showToggleButton
        showCloseButton={false}
        onClick={handleHeaderClick}
        className="relative py-4 px-5"
      >
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large" className="text-violet-500">
            {totalSelectedCount}
          </Typo.SubTitle>
          <Typo.SubTitle size="large">개 선택</Typo.SubTitle>
        </div>
      </BottomDrawer.Header>
      <BottomDrawer.Body className="p-0">
        <div className="flex gap-2 overflow-x-auto px-5 pb-[80px] scrollbar-hide">
          {selectedOptions?.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleClick(option.id)}
              className="flex items-center gap-1 px-3 py-2 bg-violet-50 rounded-full shrink-0"
            >
              <Typo.ButtonText size="medium" className="text-violet-500">
                {option.title}
              </Typo.ButtonText>
              <X className="size-4 text-violet-500" />
            </button>
          ))}
          {isOtherSelected && (
            <button
              type="button"
              onClick={onOtherClick}
              className="flex items-center gap-1 px-3 py-2 bg-violet-50 rounded-full shrink-0"
            >
              <Typo.ButtonText size="medium" className="text-violet-500">
                {textAnswer.trim() ? `기타: ${textAnswer.trim()}` : "기타"}
              </Typo.ButtonText>
              <X className="size-4 text-violet-500" />
            </button>
          )}
        </div>
      </BottomDrawer.Body>
    </BottomDrawer.Content>
  );
}
