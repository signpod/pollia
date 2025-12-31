"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ImageUploadNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

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
        aria-controls="image-upload-notice-content"
        className={cn(
          "flex w-full items-center justify-between text-left transition-all outline-none",
        )}
      >
        사진 첨부 유의사항
        <ChevronDownIcon
          className={cn(
            "size-6 shrink-0 transition-transform duration-300 ease-in-out",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <motion.div
        id="image-upload-notice-content"
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
        <ul className="flex flex-col gap-2 text-disabled pl-5 [&_li::marker]:text-xs pt-4">
          <li className="list-disc list-outside">
            <Typo.Body size="medium">
              JPG,JPEG, PNG, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.
            </Typo.Body>
          </li>
          <li className="list-disc list-outside">
            <Typo.Body size="medium">이미지 파일은 개당 5MB 이하만 업로드할 수 있습니다.</Typo.Body>
          </li>
          <li className="list-disc list-outside">
            <Typo.Body size="medium">파일 첨부는 최대 10개까지 가능합니다.</Typo.Body>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
