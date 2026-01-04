"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface MediaUploadNoticeProps {
  title: string;
  noticeItems: string[];
}

export function MediaUploadNotice({ title, noticeItems }: MediaUploadNoticeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const contentId = useId();

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        const measuredHeight = contentRef.current.scrollHeight;
        setHeight(measuredHeight);
      } else {
        const currentHeight = contentRef.current.scrollHeight;
        if (currentHeight > 0) {
          setHeight(currentHeight);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setHeight(0);
            });
          });
        }
      }
    }
  }, [isOpen]);

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="w-full p-4 rounded-md bg-zinc-50">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          "flex w-full items-center justify-between text-left transition-all outline-none",
        )}
      >
        <Typo.SubTitle size="large">{title}</Typo.SubTitle>
        <ChevronDownIcon
          className={cn(
            "size-6 shrink-0 transition-transform duration-300 ease-in-out",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <motion.div
        id={contentId}
        ref={contentRef}
        initial={false}
        animate={{
          height,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        style={{
          overflow: "hidden",
        }}
      >
        <ul className="flex flex-col gap-1 text-disabled pl-5 [&_li::marker]:text-xs pt-4">
          {noticeItems.map((item, index) => (
            <li key={index} className="list-disc list-outside">
              <Typo.Body size="medium">{item}</Typo.Body>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
