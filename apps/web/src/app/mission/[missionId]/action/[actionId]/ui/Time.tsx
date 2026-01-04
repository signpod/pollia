"use client";

import { ActionStepContentProps } from "@/constants/action";
import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { TimePickerProvider, useTimePicker } from "./TimePickerProvider";

const AM_HOURS = [8, 9, 10, 11];
const PM_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function formatTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function ActionTime({
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
  if (!updateCanGoNext || !onAnswerChange) {
    return null;
  }

  return (
    <TimePickerProvider
      maxSelections={actionData.maxSelections ?? 20}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
    >
      <TimePickerContent
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
    </TimePickerProvider>
  );
}

function TimePickerContent({
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
  const { selectedTimes, toggleTime, canGoNext } = useTimePicker();

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
      <div className="space-y-6 w-full">
        <div className="space-y-3">
          <Typo.SubTitle size="large">오전</Typo.SubTitle>
          <div className="grid grid-cols-3 gap-3">
            {AM_HOURS.map(hour => {
              const time = formatTime(hour);
              const isSelected = selectedTimes.has(time);
              return (
                <TimeButton
                  key={time}
                  time={time}
                  isSelected={isSelected}
                  onClick={() => toggleTime(time)}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Typo.SubTitle size="large">오후</Typo.SubTitle>
          <div className="grid grid-cols-3 gap-3">
            {PM_HOURS.map(hour => {
              const time = formatTime(hour);
              const isSelected = selectedTimes.has(time);
              return (
                <TimeButton
                  key={time}
                  time={time}
                  isSelected={isSelected}
                  onClick={() => toggleTime(time)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </SurveyQuestionTemplate>
  );
}

interface TimeButtonProps {
  time: string;
  isSelected: boolean;
  onClick: () => void;
}

function TimeButton({ time, isSelected, onClick }: TimeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-3 rounded-lg border-2 transition-all duration-200",
        "flex items-center justify-center",
        isSelected
          ? "border-violet-500 bg-violet-50 text-violet-500"
          : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50",
      )}
    >
      <Typo.ButtonText size="medium" className={isSelected ? "text-violet-500" : "text-zinc-900"}>
        {time}
      </Typo.ButtonText>
    </button>
  );
}
