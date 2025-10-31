"use client";

import { createContext, ReactNode, useContext, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Toaster } from "../common/Toast";

interface FixedBottomContextType {
  currentContent: ReactNode | null;
  setContent: (content: ReactNode, className: string) => void;
  clearContent: () => void;
}

const FixedBottomContext = createContext<FixedBottomContextType | null>(null);

interface FixedBottomLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomGap?: boolean;
}

export function FixedBottomLayout({
  children,
  className,
  hasBottomGap = true,
}: FixedBottomLayoutProps) {
  const [currentContent, setCurrentContent] = useState<ReactNode | null>(null);
  const [contentClassName, setContentClassName] = useState<string | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const setContent = (content: ReactNode, className: string) => {
    setCurrentContent(content);
    setContentClassName(className);
  };

  const clearContent = () => {
    setCurrentContent(null);
    setContentClassName(null);
  };

  useLayoutEffect(() => {
    if (currentContent && contentRef.current) {
      const updateHeight = () => {
        setContentHeight(contentRef.current?.offsetHeight || 0);
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);

      return () => resizeObserver.disconnect();
    } else {
      setContentHeight(0);
    }
  }, [currentContent]);

  return (
    <FixedBottomContext.Provider value={{ currentContent, setContent, clearContent }}>
      <div className={cn("relative", className)}>
        {children}
        <div
          style={{
            paddingBottom: hasBottomGap ? `${contentHeight + 20}px` : "0px",
          }}
        />

        {/* 토스트 알림 영역 */}
        <Toaster offset={contentHeight + 16} />

        {/* 고정 콘텐츠 영역 */}
        {currentContent && (
          <div
            ref={contentRef}
            className={cn(
              "fixed right-0 bottom-0 left-0 z-50 bg-white",
              "mx-auto max-w-lg",
              contentClassName,
            )}
          >
            {currentContent}
          </div>
        )}
      </div>
    </FixedBottomContext.Provider>
  );
}

interface FixedBottomContentProps {
  children: ReactNode;
  className?: string;
}

export function FixedBottomContent({ children, className }: FixedBottomContentProps) {
  const context = useContext(FixedBottomContext);

  if (!context) {
    throw new Error("FixedBottomLayout.Content must be used within FixedBottomLayout");
  }

  const { setContent, clearContent } = context;

  useLayoutEffect(() => {
    setContent(children, className ?? "");

    return () => {
      clearContent();
    };
  }, [children, setContent, clearContent, className]);

  return null;
}
