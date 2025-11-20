"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface SurveyRewardProps {
  rewardName: string;
  rewardImage?: string;
  rewardDescription?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function SurveyReward({
  rewardName,
  rewardImage,
  rewardDescription,
  onVisibilityChange,
}: SurveyRewardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const headerButtonRef = useRef<HTMLButtonElement>(null);
  const headerDivRef = useRef<HTMLDivElement>(null);
  const hasNameNewLine = rewardName.includes("\n");
  const hasChevron = isTruncated || hasNameNewLine;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    const checkTruncation = () => {
      const titleElement = titleRef.current;

      const isTitleTruncated = titleElement
        ? titleElement.scrollWidth > titleElement.clientWidth ||
          titleElement.scrollHeight > titleElement.clientHeight
        : false;

      setIsTruncated(isTitleTruncated);
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [rewardName, rewardDescription]);

  useEffect(() => {
    if (!onVisibilityChange) return;

    const headerElement = headerButtonRef.current || headerDivRef.current;
    if (!headerElement) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          onVisibilityChange(entry.isIntersecting);
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    observer.observe(headerElement);

    return () => {
      observer.disconnect();
    };
  }, [onVisibilityChange]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col rounded-sm bg-white px-3 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
        {hasChevron ? (
          <button
            ref={headerButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center gap-2 py-3 "
            type="button"
          >
            <div className="flex-1">
              <Typo.Body size="medium" className="text-info text-left">
                설문 리워드
              </Typo.Body>
            </div>
            <div className="shrink-0 size-6 flex items-center justify-center text-disabled">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
        ) : (
          <div ref={headerDivRef} className="flex w-full items-center gap-2 py-3">
            <div className="flex-1">
              <Typo.Body size="medium" className="text-info text-left">
                설문 리워드
              </Typo.Body>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex w-full gap-4 border-t border-default py-3",
            hasNameNewLine || isTruncated ? "items-start" : "items-center",
          )}
        >
          <div className="flex w-full flex-1 flex-col gap-1">
            <Typo.Body
              size="medium"
              ref={titleRef}
              className={cn("whitespace-pre-line", !isOpen && "line-clamp-2")}
            >
              {rewardName}
            </Typo.Body>
          </div>
          {rewardImage && (
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-light">
              <Image
                src={rewardImage}
                alt={rewardName}
                width={32}
                height={32}
                className="max-h-8 max-w-8 h-auto w-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
      {rewardDescription && (
        <Typo.Body size="small" className="text-info whitespace-pre-line px-1">
          * {rewardDescription}
        </Typo.Body>
      )}
    </div>
  );
}
