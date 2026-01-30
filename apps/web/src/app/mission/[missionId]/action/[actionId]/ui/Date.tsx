"use client";

import { ActionStepContentProps } from "@/constants/action";
import { useIsMobile } from "@/hooks/common/useIsMobile";
import { formatDateToYYYYMMDD } from "@/lib/date";
import { cn } from "@/lib/utils";
import { BottomDrawer, Calendar, Typo, useBottomDrawer } from "@repo/ui/components";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";

import { getHolidayNames } from "@hyunbinseo/holidays-kr";
import { ko } from "date-fns/locale";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { useActionContext } from "../providers/ActionContext";
import { DatePickerProvider, useDatePicker } from "./DatePickerProvider";

function formatDateForDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${Number(month)}.${Number(day)}`;
}

function getHolidayName(date: Date): string | null {
  try {
    const holidayNames = getHolidayNames(date);
    const firstHoliday = holidayNames?.[0];
    return firstHoliday ?? null;
  } catch {
    return null;
  }
}

export function ActionDate({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  return (
    <DatePickerProvider
      maxSelections={actionData.maxSelections ?? 20}
      actionId={actionData.id}
      isRequired={actionData.isRequired}
      missionResponse={missionResponse}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
      nextActionId={actionData.nextActionId}
      nextCompletionId={actionData.nextCompletionId}
    >
      <DatePickerContent actionData={actionData} />
    </DatePickerProvider>
  );
}

function DatePickerContent({ actionData }: ActionStepContentProps) {
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
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
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
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-md flex items-center justify-center disabled:text-zinc-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
              const isHoliday = Boolean(getHolidayName(day.date));

              return (
                <button
                  {...buttonProps}
                  className={cn(
                    "rounded-sm w-full aspect-square flex flex-col gap-0 items-center justify-center transition-all duration-200 p-1",
                    "hover:bg-zinc-50",
                    isSelected &&
                      "bg-violet-50 text-violet-500 hover:bg-violet-100 ring ring-violet-500",
                    isToday && !isSelected && "ring-1 ring-zinc-300",
                    isSunday &&
                      !isSelected &&
                      !modifiers.outside &&
                      !modifiers.disabled &&
                      "text-red-500",
                    modifiers.outside
                      ? "text-disabled"
                      : isSelected
                        ? ""
                        : modifiers.disabled
                          ? ""
                          : "text-zinc-900",
                    modifiers.disabled && "cursor-not-allowed text-disabled",
                  )}
                >
                  <Typo.ButtonText
                    size="medium"
                    className={cn(
                      isSelected
                        ? "text-violet-500"
                        : modifiers.disabled || modifiers.outside
                          ? "text-disabled"
                          : isHoliday || isSunday
                            ? "text-red-500"
                            : "text-zinc-900",
                    )}
                  >
                    {day.date.getDate()}
                  </Typo.ButtonText>
                </button>
              );
            },
          }}
        />
      </div>
      {actionData.maxSelections && actionData.maxSelections > 1 && (
        <BottomDrawer collapsedHeight={120} expandedHeight={180}>
          <SelectedDatesDrawerContent
            selectedDates={selectedDates}
            onRemoveDate={dateStr => {
              const newDates = Array.from(selectedDates).filter(d => d !== dateStr);
              setDates(newDates);
            }}
          />
        </BottomDrawer>
      )}
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
      <BottomDrawer.Body className="p-0">
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
