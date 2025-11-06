"use client";

import { Typo } from "@repo/ui/components";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SurveyRewardProps {
  rewardName: string;
  rewardImage?: string;
  rewardDescription?: string;
}

export function SurveyReward({ rewardName, rewardImage, rewardDescription }: SurveyRewardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      const titleElement = titleRef.current;
      const descriptionElement = descriptionRef.current;

      const isTitleTruncated = titleElement
        ? titleElement.scrollWidth > titleElement.clientWidth
        : false;
      const isDescriptionTruncated = descriptionElement
        ? descriptionElement.scrollWidth > descriptionElement.clientWidth
        : false;

      setIsTruncated(isTitleTruncated || isDescriptionTruncated);
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-2 rounded-sm bg-white p-3 shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]">
      {isTruncated && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-start gap-2"
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
      )}

      {!isTruncated && (
        <div className="flex w-full items-start gap-2">
          <div className="flex-1">
            <Typo.Body size="medium" className="text-info text-left">
              설문 리워드
            </Typo.Body>
          </div>
        </div>
      )}

      {isOpen && isTruncated ? (
        <div className="flex w-full flex-col gap-2">
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

          <div className="flex w-full flex-col gap-1">
            <Typo.Body size="medium" className="whitespace-pre-line">
              {rewardName}
            </Typo.Body>
            {rewardDescription && (
              <Typo.Body size="small" className="text-info whitespace-pre-line">
                * {rewardDescription}
              </Typo.Body>
            )}
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center gap-4">
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

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typo.Body size="medium" className="truncate" ref={titleRef}>
              {rewardName}
            </Typo.Body>
            {rewardDescription && (
              <Typo.Body size="small" className="text-info truncate" ref={descriptionRef}>
                * {rewardDescription}
              </Typo.Body>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
