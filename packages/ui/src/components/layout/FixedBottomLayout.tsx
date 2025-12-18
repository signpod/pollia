"use client";

import { ReactNode, createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Toaster } from "../common/Toast";

interface FixedBottomContextType {
  currentContent: ReactNode | null;
  setContent: (content: ReactNode, className: string) => void;
  clearContent: () => void;
}

const FixedBottomContext = createContext<FixedBottomContextType | null>(null);

const BLUR_LAYERS = [
  { heightRatio: 1.0, blur: 0.2 },
  { heightRatio: 0.92, blur: 0.3 },
  { heightRatio: 0.85, blur: 0.5 },
  { heightRatio: 0.77, blur: 0.8 },
  { heightRatio: 0.68, blur: 1.2 },
  { heightRatio: 0.58, blur: 1.8 },
  { heightRatio: 0.48, blur: 2.5 },
  { heightRatio: 0.37, blur: 3.5 },
  { heightRatio: 0.25, blur: 5 },
  { heightRatio: 0.12, blur: 7 },
];

function GradientBlurLayers({ baseHeight }: { baseHeight: number }) {
  return (
    <>
      {BLUR_LAYERS.map(layer => (
        <div
          key={layer.blur}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-49"
          style={{
            height: `${baseHeight * layer.heightRatio}px`,
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
          }}
        />
      ))}
    </>
  );
}

interface FixedBottomLayoutProps {
  children: ReactNode;
  className?: string;
  hasBottomGap?: boolean;
  hasGradient?: boolean;
  hasGradientBlur?: boolean;
}

export function FixedBottomLayout({
  children,
  className,
  hasBottomGap = true,
  hasGradient = false,
  hasGradientBlur = false,
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
    }
    setContentHeight(0);
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
              "fixed right-0 bottom-0 left-0 z-50",
              hasGradient || hasGradientBlur ? "bg-transparent" : "bg-white",
              "mx-auto max-w-lg",
              contentClassName,
            )}
          >
            {hasGradient && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-49 h-[100px]"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 1) 100%)",
                }}
              />
            )}
            {hasGradientBlur && <GradientBlurLayers baseHeight={contentHeight + 12} />}
            <div className="relative z-50 w-full">{currentContent}</div>
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
