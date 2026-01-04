"use client";

import { ActionStepContentProps } from "@/constants/action";
import { Calendar } from "@repo/ui/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { ko } from "date-fns/locale";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { DatePickerProvider, useDatePicker } from "./DatePickerProvider";

export function ActionDate({
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
    <DatePickerProvider
      maxSelections={actionData.maxSelections ?? 20}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext ?? (() => {})}
      onAnswerChange={onAnswerChange ?? (() => {})}
    >
      <DatePickerContent
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
    </DatePickerProvider>
  );
}

function DatePickerContent({
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
  const { selectedDates, toggleDate, canGoNext } = useDatePicker();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateObjects = Array.from(selectedDates).map(dateStr => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date;
  });

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;

    const newDate = dates[dates.length - 1];
    if (newDate) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      const newDateStr = `${year}-${month}-${day}`;
      toggleDate(newDateStr);
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
    >
      <div className="flex w-full px-4">
        <Calendar
          mode="multiple"
          captionLayout="label"
          showOutsideDays={true}
          locale={ko}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={selectedDateObjects}
          onSelect={handleDateSelect}
          disabled={{ before: today }}
          className="w-full"
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "w-full",
            month_caption: "flex justify-between items-center h-12 mb-4",
            nav: "hidden",
            caption_label: "text-lg font-semibold",
            weekdays: "flex w-full mb-2",
            weekday: "flex-1 text-center text-zinc-400 font-normal text-sm",
            month_grid: "w-full",
            week: "flex w-full gap-1 mb-1",
            day: "flex-1 p-0",
            table: "w-full",
            today: "font-bold",
          }}
          formatters={{
            formatCaption: (date) => {
              return `${date.getMonth() + 1}월`;
            },
            formatWeekdayName: (weekday: Date) => {
              const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
              return weekdayNames[weekday.getDay()] || "";
            },
          }}
          components={{
            MonthCaption: ({ calendarMonth }) => {
              const displayMonth = calendarMonth.date;

              const handlePrevMonth = () => {
                const newDate = new Date(displayMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              };

              const handleNextMonth = () => {
                const newDate = new Date(displayMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              };

              return (
                <div className="flex justify-between items-center h-12 mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-md flex items-center justify-center"
                  >
                    <ChevronLeft className="h-5 w-5 text-zinc-600" />
                  </button>
                  <span className="text-lg font-semibold">{displayMonth.getMonth() + 1}월</span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-md flex items-center justify-center"
                  >
                    <ChevronRight className="h-5 w-5 text-zinc-600" />
                  </button>
                </div>
              );
            },
            DayButton: (
              props: {
                day: { date: Date };
                modifiers: { selected?: boolean; disabled?: boolean; outside?: boolean };
              } & React.ButtonHTMLAttributes<HTMLButtonElement>,
            ) => {
              const { day, modifiers, ...buttonProps } = props;
              const isSunday = day.date.getDay() === 0;
              const isSelected = modifiers.selected;

              return (
                <button
                  {...buttonProps}
                  className={`
                    aspect-square w-full rounded-full
                    flex items-center justify-center
                    text-base font-normal
                    transition-all duration-200
                    ${isSelected ? "bg-zinc-950 text-white" : "hover:bg-zinc-100"}
                    ${isSunday && !isSelected && !modifiers.outside ? "text-red-500" : ""}
                    ${modifiers.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${modifiers.outside ? "text-zinc-300" : modifiers.selected ? "" : "text-zinc-900"}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            },
          }}
        />
      </div>
    </SurveyQuestionTemplate>
  );
}
