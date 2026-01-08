"use client";

import { ActionStepContentProps } from "@/constants/action";
import { formatDateToHHMM } from "@/lib/date";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface TimePickerContextValue {
  selectedTimes: Set<string>;
  toggleTime: (time: string) => void;
  addTime: (time: string) => void;
  removeTime: (time: string) => void;
  canGoNext: boolean;
  maxSelections: number;
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
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    if (!missionResponse?.data) return;

    const submittedTimes = missionResponse.data.answers
      .filter(answer => answer.actionId === actionId)
      .flatMap(answer => {
        if (!answer.dateAnswers) return [];
        return answer.dateAnswers.map(dateStr => formatDateToHHMM(dateStr));
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

  const addTime = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.has(time) || prev.size >= maxSelections) {
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(time);
      return newSet;
    });
  };

  const removeTime = (time: string) => {
    setSelectedTimes(prev => {
      const newSet = new Set(prev);
      newSet.delete(time);
      return newSet;
    });
  };

  const canGoNext = isRequired ? selectedTimes.size > 0 : true;

  const convertTimesToDateStrings = useCallback((times: Set<string>): string[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return Array.from(times).map(time => `${year}-${month}-${day}T${time}:00`);
  }, []);

  useEffect(() => {
    updateCanGoNextRef.current?.(canGoNext);
  }, [canGoNext]);

  useEffect(() => {
    onAnswerChangeRef.current?.({
      actionId,
      type: ActionType.TIME,
      isRequired,
      dateAnswers: selectedTimes.size > 0 ? convertTimesToDateStrings(selectedTimes) : undefined,
    });
  }, [selectedTimes, actionId, isRequired, convertTimesToDateStrings]);

  return (
    <TimePickerContext.Provider
      value={{ selectedTimes, toggleTime, addTime, removeTime, canGoNext, maxSelections }}
    >
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
