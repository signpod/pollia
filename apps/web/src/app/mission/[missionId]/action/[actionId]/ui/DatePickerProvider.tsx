"use client";

import { ActionStepContentProps } from "@/constants/action";
import { formatDateToYYYYMMDD } from "@/lib/date";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface DatePickerContextValue {
  selectedDates: Set<string>;
  toggleDate: (date: string) => void;
  setDates: (dates: string[]) => void;
  canGoNext: boolean;
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null);

interface DatePickerProviderProps {
  maxSelections: number;
  actionId: string;
  isRequired: boolean;
  missionResponse?: ActionStepContentProps["missionResponse"];
  updateCanGoNext: (canGoNext: boolean) => void;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  children: React.ReactNode;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export function DatePickerProvider({
  maxSelections,
  actionId,
  isRequired,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  children,
  nextActionId,
  nextCompletionId,
}: DatePickerProviderProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    if (!missionResponse?.data) return;

    const submittedDates = missionResponse.data.answers
      .filter(answer => answer.actionId === actionId)
      .flatMap(answer => {
        if (!answer.dateAnswers) return [];
        return answer.dateAnswers.map(dateStr => formatDateToYYYYMMDD(dateStr));
      })
      .filter(d => d !== "");

    if (submittedDates.length > 0) {
      setSelectedDates(new Set(submittedDates));
    }
  }, [missionResponse, actionId]);

  const toggleDate = (date: string) => {
    setSelectedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        if (newSet.size >= maxSelections) {
          const firstDate = Array.from(newSet)[0];
          if (firstDate) {
            newSet.delete(firstDate);
          }
        }
        newSet.add(date);
      }
      return newSet;
    });
  };

  const setDates = (dates: string[]) => {
    if (maxSelections === 1 && dates.length > 1) {
      const lastDate = dates[dates.length - 1];
      setSelectedDates(new Set(lastDate ? [lastDate] : []));
      return;
    }
    const limitedDates = dates.slice(0, maxSelections);
    setSelectedDates(new Set(limitedDates));
  };

  const canGoNext = isRequired ? selectedDates.size > 0 : true;

  useEffect(() => {
    updateCanGoNextRef.current?.(canGoNext);
  }, [canGoNext]);

  useEffect(() => {
    onAnswerChangeRef.current?.({
      actionId,
      type: ActionType.DATE,
      isRequired,
      dateAnswers: selectedDates.size > 0 ? Array.from(selectedDates) : undefined,
      ...(nextActionId && { nextActionId }),
      ...(nextCompletionId && { nextCompletionId }),
    });
  }, [selectedDates, actionId, isRequired, nextActionId, nextCompletionId]);

  return (
    <DatePickerContext.Provider value={{ selectedDates, toggleDate, setDates, canGoNext }}>
      {children}
    </DatePickerContext.Provider>
  );
}

export function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error("useDatePicker must be used within DatePickerProvider");
  }
  return context;
}
