"use client";

import { ActionStepContentProps } from "@/constants/action";
import { cn } from "@/lib/utils";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Dialog, DialogPortal } from "@repo/ui/components";
import { Plus, X } from "lucide-react";
import * as React from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";
import { TimePickerProvider, useTimePicker } from "./TimePickerProvider";

function formatTimeForStorage(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeForDisplay(time: string): string {
  const parts = time.split(":");
  const hourStr = parts[0] ?? "00";
  const minuteStr = parts[1] ?? "00";
  const hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return "00:00";
  }

  const isAM = hour < 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${isAM ? "오전" : "오후"} ${String(displayHour).padStart(2, "0")} : ${String(minute).padStart(2, "0")}`;
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
      nextActionId={actionData.nextActionId}
      nextCompletionId={actionData.nextCompletionId}
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
  const { selectedTimes, removeTime, canGoNext, maxSelections } = useTimePicker();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const sortedTimes = React.useMemo(() => {
    return Array.from(selectedTimes).sort();
  }, [selectedTimes]);

  const canAddMore = selectedTimes.size < maxSelections;

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
      <div className="flex flex-col gap-3 w-full justify-center items-center">
        {sortedTimes.map(time => (
          <SelectedTimeCard key={time} time={time} onRemove={() => removeTime(time)} />
        ))}

        {canAddMore &&
          (sortedTimes.length > 0 ? (
            <ButtonV2
              onClick={() => setIsDialogOpen(true)}
              variant="tertiary"
              size="large"
              className="rounded-full size-12 bg-zinc-50"
            >
              <Plus className="size-5" />
            </ButtonV2>
          ) : (
            <ButtonV2
              onClick={() => setIsDialogOpen(true)}
              variant="secondary"
              size="large"
              className="hover:ring-0! hover:bg-zinc-50! hover:text-zinc-900! w-full"
            >
              <div className="w-full flex items-center justify-center gap-3">
                <Plus className="size-5" />
                <Typo.Body size="large">시간 추가</Typo.Body>
              </div>
            </ButtonV2>
          ))}
      </div>

      <TimeSelectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </SurveyQuestionTemplate>
  );
}

function SelectedTimeCard({ time, onRemove }: { time: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-sm ring-1 ring-default w-full">
      <Typo.Body size="large" className="text-zinc-900">
        {formatTimeForDisplay(time)}
      </Typo.Body>
      <button type="button" onClick={onRemove} className="p-1">
        <X className="size-5" />
      </button>
    </div>
  );
}

interface TimeSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERIODS = ["오전", "오후"] as const;
const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

function TimeSelectDialog({ open, onOpenChange }: TimeSelectDialogProps) {
  const { selectedTimes, addTime, maxSelections } = useTimePicker();
  const [period, setPeriod] = React.useState<"오전" | "오후">("오전");
  const [hour, setHour] = React.useState("08");
  const [minute, setMinute] = React.useState("00");

  const canAddMore = selectedTimes.size < maxSelections;

  const getDisplayTime = () => {
    return `${period}  ${hour} : ${minute}`;
  };

  const handleConfirm = () => {
    const hour24 =
      period === "오후"
        ? hour === "12"
          ? 12
          : Number.parseInt(hour) + 12
        : hour === "12"
          ? 0
          : Number.parseInt(hour);
    const timeStr = formatTimeForStorage(hour24, Number.parseInt(minute));

    if (!selectedTimes.has(timeStr) && canAddMore) {
      addTime(timeStr);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div
              className={cn(
                "absolute inset-0 bg-black/80",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              )}
              data-state="open"
              onClick={handleClose}
            />
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_0px_rgba(9,9,11,0.08)]",
                "animate-in slide-in-from-bottom duration-300",
              )}
            >
              <div className="flex items-center justify-end py-4 px-5">
                <button type="button" onClick={handleClose} className="text-zinc-900">
                  <Typo.Body size="large">닫기</Typo.Body>
                </button>
              </div>

              <div className="flex items-center justify-center py-4">
                <Typo.MainTitle size="medium" className="text-zinc-900">
                  {getDisplayTime()}
                </Typo.MainTitle>
              </div>

              <div className="relative px-5 py-4">
                <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-11 bg-zinc-50 rounded-sm pointer-events-none" />

                <div className="relative flex items-center">
                  <div className="flex-1">
                    <WheelPicker
                      items={PERIODS}
                      value={period}
                      onChange={v => setPeriod(v as "오전" | "오후")}
                    />
                  </div>

                  <div className="flex-1 flex items-center">
                    <div className="flex-1">
                      <WheelPicker items={HOURS} value={hour} onChange={setHour} />
                    </div>
                    <div className="flex items-center justify-center w-6 shrink-0">
                      <Typo.Body size="large" className="text-zinc-400">
                        :
                      </Typo.Body>
                    </div>
                  </div>

                  <div className="flex-1">
                    <WheelPicker items={MINUTES} value={minute} onChange={setMinute} />
                  </div>
                </div>
              </div>

              <div className="px-5 py-6">
                <ButtonV2 onClick={handleConfirm} className="w-full">
                  <div className="flex items-center justify-center w-full">확인</div>
                </ButtonV2>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}

interface WheelPickerProps {
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

function WheelPicker({ items, value, onChange }: WheelPickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isSnappingRef = React.useRef(false);
  const itemHeight = 44;
  const visibleItems = 5;
  const paddingItems = Math.floor(visibleItems / 2);
  const centerOffset = paddingItems * itemHeight;

  const currentIndex = items.indexOf(value);
  const [scrollTop, setScrollTop] = React.useState(currentIndex * itemHeight);

  // Drag state refs
  const isDraggingRef = React.useRef(false);
  const startYRef = React.useRef(0);
  const startScrollTopRef = React.useRef(0);

  React.useEffect(() => {
    if (containerRef.current && currentIndex !== -1) {
      containerRef.current.scrollTop = currentIndex * itemHeight;
      setScrollTop(currentIndex * itemHeight);
    }
  }, []);

  const snapToNearest = React.useCallback(() => {
    if (!containerRef.current) return;

    const currentScrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(currentScrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    const targetScroll = clampedIndex * itemHeight;

    isSnappingRef.current = true;
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    setTimeout(() => {
      isSnappingRef.current = false;
    }, 150);

    if (items[clampedIndex] && items[clampedIndex] !== value) {
      onChange(items[clampedIndex]);
    }
  }, [items, value, onChange]);

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || isSnappingRef.current) return;

    setScrollTop(containerRef.current.scrollTop);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(snapToNearest, 50);
  }, [snapToNearest]);

  // Mouse drag handlers for PC
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startScrollTopRef.current = containerRef.current?.scrollTop ?? 0;
    e.preventDefault();
  }, []);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const deltaY = startYRef.current - e.clientY;
    containerRef.current.scrollTop = startScrollTopRef.current + deltaY;
  }, []);

  const handleMouseUp = React.useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      snapToNearest();
    }
  }, [snapToNearest]);

  const handleMouseLeave = React.useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      snapToNearest();
    }
  }, [snapToNearest]);

  // Touch drag handlers for mobile
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    isDraggingRef.current = true;
    startYRef.current = touch.clientY;
    startScrollTopRef.current = containerRef.current?.scrollTop ?? 0;
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaY = startYRef.current - touch.clientY;
    containerRef.current.scrollTop = startScrollTopRef.current + deltaY;
    e.preventDefault();
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      snapToNearest();
    }
  }, [snapToNearest]);

  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getItemColor = (index: number) => {
    const itemCenter = centerOffset + index * itemHeight + itemHeight / 2;
    const viewCenter = scrollTop + centerOffset + itemHeight / 2;
    const distance = Math.abs(itemCenter - viewCenter);
    const maxDistance = itemHeight * 2;

    const ratio = Math.min(1, distance / maxDistance);
    const lightness = Math.round(ratio * 80);

    return `rgb(${lightness}% ${lightness}% ${lightness}%)`;
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "h-[220px] overflow-y-auto cursor-grab active:cursor-grabbing select-none",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      )}
      style={{ touchAction: "none" }}
    >
      <div style={{ height: `${paddingItems * itemHeight}px` }} />
      {items.map((item, index) => {
        const color = getItemColor(index);
        return (
          <div
            key={item}
            className="flex items-center justify-center"
            style={{ height: `${itemHeight}px`, color }}
          >
            <Typo.Body size="large">{item}</Typo.Body>
          </div>
        );
      })}
      <div style={{ height: `${paddingItems * itemHeight}px` }} />
    </div>
  );
}
