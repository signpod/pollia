"use client";

import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { createContext, useContext, useEffect, useState } from "react";

interface TimePickerContextValue {
  selectedTimes: Set<string>;
  toggleTime: (time: string) => void;
  canGoNext: boolean;
}

const TimePickerContext = createContext<TimePickerContextValue | null>(null);

interface TimePickerProviderProps {
  maxSelections: number;
  actionId: string;
  isRequired: boolean;
  missionResponse?: ActionStepContentProps["missionResponse"];
  updateCanGoNext: (canGoNext: boolean) => void;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  children: React.ReactNode;
}

export function TimePickerProvider({
  maxSelections,
  actionId,
  isRequired,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  children,
}: TimePickerProviderProps) {
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!missionResponse?.data) return;

    const submittedTimes = missionResponse.data.answers
      .filter(answer => answer.actionId === actionId)
      .flatMap(answer => {
        if (!answer.dateAnswers) return [];
        return answer.dateAnswers.map(dateStr => {
          const date = new Date(dateStr);
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${hours}:${minutes}`;
        });
      })
      .filter(t => t !== "");

    if (submittedTimes.length > 0) {
      setSelectedTimes(new Set(submittedTimes));
    }
  }, [missionResponse, actionId]);

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(time)) {
        newSet.delete(time);
      } else {
        if (newSet.size >= maxSelections) {
          const firstTime = Array.from(newSet)[0];
          if (firstTime) {
            newSet.delete(firstTime);
          }
        }
        newSet.add(time);
      }
      return newSet;
    });
  };

  const canGoNext = isRequired ? selectedTimes.size > 0 : true;

  useEffect(() => {
    updateCanGoNext(canGoNext);
  }, [canGoNext, updateCanGoNext]);

  useEffect(() => {
    const convertTimesToDateStrings = (times: Set<string>): string[] => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return Array.from(times).map(time => `${year}-${month}-${day}T${time}:00`);
    };

    onAnswerChange({
      actionId,
      type: ActionType.TIME,
      isRequired,
      dateAnswers:
        selectedTimes.size > 0 ? convertTimesToDateStrings(selectedTimes) : undefined,
    });
  }, [selectedTimes, actionId, isRequired, onAnswerChange]);

  return (
    <TimePickerContext.Provider value={{ selectedTimes, toggleTime, canGoNext }}>
      {children}
    </TimePickerContext.Provider>
  );
}

export function useTimePicker() {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error("useTimePicker must be used within TimePickerProvider");
  }
  return context;
}
