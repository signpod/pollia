"use client";

import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { createContext, useContext, useEffect, useState } from "react";

interface DatePickerContextValue {
  selectedDates: Set<string>;
  toggleDate: (date: string) => void;
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
}

export function DatePickerProvider({
  maxSelections,
  actionId,
  isRequired,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  children,
}: DatePickerProviderProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!missionResponse?.data) return;

    const submittedDates = missionResponse.data.answers
      .filter(answer => answer.actionId === actionId)
      .flatMap(answer => {
        if (!answer.dateAnswers) return [];
        return answer.dateAnswers.map(dateStr => {
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        });
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

  const canGoNext = isRequired ? selectedDates.size > 0 : true;

  useEffect(() => {
    updateCanGoNext(canGoNext);
  }, [canGoNext, updateCanGoNext]);

  useEffect(() => {
    onAnswerChange({
      actionId,
      type: ActionType.DATE,
      isRequired,
      dateAnswers: selectedDates.size > 0 ? Array.from(selectedDates) : undefined,
    });
  }, [selectedDates, actionId, isRequired, onAnswerChange]);

  return (
    <DatePickerContext.Provider value={{ selectedDates, toggleDate, canGoNext }}>
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
