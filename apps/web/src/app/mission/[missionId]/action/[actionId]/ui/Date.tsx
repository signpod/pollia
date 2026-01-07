"use client";

import { ActionStepContentProps } from "@/constants/action";
import { useIsMobile } from "@/hooks/common/useIsMobile";
import { formatDateToYYYYMMDD } from "@/lib/date";
import { cn } from "@/lib/utils";
import { BottomDrawer, Calendar, Typo, useBottomDrawer } from "@repo/ui/components";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";

import { ko } from "date-fns/locale";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { DatePickerProvider, useDatePicker } from "./DatePickerProvider";

function formatDateForDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${Number(month)}.${Number(day)}`;
}

const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "신정",
  "03-01": "3.1절",
  "05-05": "어린이날",
  "06-06": "현충일",
  "08-15": "광복절",
  "10-03": "개천절",
  "10-09": "한글날",
  "12-25": "성탄절",
};

const LUNAR_HOLIDAYS: Record<string, string> = {
  "2025-01-28": "설날",
  "2025-01-29": "설날",
  "2025-01-30": "설날",
  "2025-10-05": "추석",
  "2025-10-06": "추석",
  "2025-10-07": "추석",
  "2026-02-16": "설날",
  "2026-02-17": "설날",
  "2026-02-18": "설날",
  "2026-09-24": "추석",
  "2026-09-25": "추석",
  "2026-09-26": "추석",
  "2027-02-05": "설날",
  "2027-02-06": "설날",
  "2027-02-07": "설날",
  "2027-10-14": "추석",
  "2027-10-15": "추석",
  "2027-10-16": "추석",
};

function getHolidayName(date: Date): string | null {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (FIXED_HOLIDAYS[monthDay]) {
    return FIXED_HOLIDAYS[monthDay];
  }

  const fullDate = `${date.getFullYear()}-${monthDay}`;
  if (LUNAR_HOLIDAYS[fullDate]) {
    return LUNAR_HOLIDAYS[fullDate];
  }

  return null;

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
  if (!updateCanGoNext || !onAnswerChange) {
    return null;
  }

  return (
    <DatePickerProvider
      maxSelections={actionData.maxSelections ?? 20}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
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
  const { selectedDates, setDates, canGoNext } = useDatePicker();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateObjects = React.useMemo(() => {
    return Array.from(selectedDates).map(dateStr => {
      return new Date(`${dateStr}T00:00:00`);
    });
  }, [selectedDates]);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setDates([]);
      return;
    }

    const dateStrings = dates.map(date => formatDateToYYYYMMDD(date));
    setDates(dateStrings);
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
      <div className="flex w-full">
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
            weekday: "flex-1 text-center text-info font-normal text-sm",
            month_grid: "w-full",
            week: "flex w-full gap-1 mb-1",
            day: "flex-1 p-0",
            table: "w-full",
            today: "font-bold",
          }}
          formatters={{
            formatCaption: date => {
              return `${date.getMonth() + 1}월`;
            },
          }}
          components={{
            Weekday: ({ children, ...props }) => {
              return (
                <th {...props}>
                  <Typo.SubTitle size="large" className="text-info">
                    {children}
                  </Typo.SubTitle>
                </th>
              );
            },
            MonthCaption: ({ calendarMonth }) => {
              const displayMonth = calendarMonth.date;
              const currentDate = new Date();
              const isCurrentMonth =
                displayMonth.getFullYear() === currentDate.getFullYear() &&
                displayMonth.getMonth() === currentDate.getMonth();

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
                <div className="flex justify-center items-center gap-6 h-12 mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isCurrentMonth}
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-5 w-5 text-zinc-600" />
                  </button>
                  <Typo.SubTitle size="large">{`${displayMonth.getFullYear()}. ${String(displayMonth.getMonth() + 1).padStart(2, "0")}`}</Typo.SubTitle>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-md flex items-center justify-center"
                  >
                    <ChevronRight className="size-4 icon-default" />
                  </button>
                </div>
              );
            },
            DayButton: (
              props: {
                day: { date: Date };
                modifiers: {
                  selected?: boolean;
                  disabled?: boolean;
                  outside?: boolean;
                  today?: boolean;
                };
              } & React.ButtonHTMLAttributes<HTMLButtonElement>,
            ) => {
              const { day, modifiers, ...buttonProps } = props;
              const isSunday = day.date.getDay() === 0;
              const isSelected = modifiers.selected;
              const isToday = modifiers.today;
              const holidayName = getHolidayName(day.date);
              const label = isToday ? "오늘" : holidayName;

              return (
                <button
                  {...buttonProps}
                  className={cn(
                    "rounded-sm w-full aspect-[48/55] flex flex-col gap-0 items-center justify-center transition-all duration-200 p-1",
                    isSelected && "bg-violet-50 text-violet-500",
                    isToday && !isSelected && "ring-1 ring-zinc-300",
                    isSunday &&
                      !isSelected &&
                      !modifiers.outside &&
                      !modifiers.disabled &&
                      "text-red-500",
                    modifiers.outside
                      ? "text-zinc-300"
                      : isSelected
                        ? ""
                        : modifiers.disabled
                          ? ""
                          : "text-zinc-900",
                    modifiers.disabled && "cursor-not-allowed text-zinc-300",
                  )}
                >
                  <Typo.ButtonText size="medium">{day.date.getDate()}</Typo.ButtonText>
                  {label ? (
                    <Typo.Body
                      size="small"
                      className={cn(
                        "text-info",
                        isSelected && "text-violet-500",
                        holidayName && !isSelected && !modifiers.disabled && "text-info",
                      )}
                    >
                      {label}
                    </Typo.Body>
                  ) : (
                    <div className="h-5" />
                  )}
                </button>
              );
            },
          }}
        />
      </div>
      <BottomDrawer collapsedHeight={140} expandedHeight={210}>
        <SelectedDatesDrawerContent
          selectedDates={selectedDates}
          onRemoveDate={dateStr => {
            const newDates = Array.from(selectedDates).filter(d => d !== dateStr);
            setDates(newDates);
          }}
        />
      </BottomDrawer>
    </SurveyQuestionTemplate>
  );
}

function SelectedDatesDrawerContent({
  selectedDates,
  onRemoveDate,
}: {
  selectedDates: Set<string>;
  onRemoveDate: (dateStr: string) => void;
}) {
  const { toggle } = useBottomDrawer();
  const isMobile = useIsMobile();

  const handleHeaderClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    toggle();
  };

  const sortedDates = React.useMemo(() => {
    return Array.from(selectedDates).sort();
  }, [selectedDates]);

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
            {selectedDates.size}
          </Typo.SubTitle>
          <Typo.SubTitle size="large">개 선택</Typo.SubTitle>
        </div>
      </BottomDrawer.Header>
      <BottomDrawer.Body className="py-2 px-0">
        <div className="flex gap-2 overflow-x-auto px-5 pb-[80px] scrollbar-hide">
          {sortedDates.map(dateStr => (
            <button
              key={dateStr}
              type="button"
              onClick={() => onRemoveDate(dateStr)}
              className="flex items-center gap-1 px-3 py-2 bg-violet-50 rounded-full shrink-0"
            >
              <Typo.ButtonText size="medium" className="text-violet-500">
                {formatDateForDisplay(dateStr)}
              </Typo.ButtonText>
              <X className="size-4 text-violet-500" />
            </button>
          ))}
        </div>
      </BottomDrawer.Body>
    </BottomDrawer.Content>
  );
}
