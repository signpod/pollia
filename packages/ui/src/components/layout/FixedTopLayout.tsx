"use client";

import { cn } from "../../lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useLayoutEffect,
} from "react";

interface FixedTopContextType {
  currentContent: ReactNode | null;
  setContent: (content: ReactNode, className: string) => void;
  clearContent: () => void;
}

const FixedTopContext = createContext<FixedTopContextType | null>(null);

interface FixedTopLayoutProps {
  children: ReactNode;
  className?: string;
  hasTopGap?: boolean;
}

export function FixedTopLayout({
  children,
  className,
  hasTopGap = true,
}: FixedTopLayoutProps) {
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
    <FixedTopContext.Provider
      value={{ currentContent, setContent, clearContent }}
    >
      <div className={cn("relative", className)}>
        {currentContent && (
          <div
            ref={contentRef}
            className={cn(
              "fixed top-0 left-0 right-0 z-50 bg-white",
              "max-w-lg mx-auto",
              contentClassName
            )}
          >
            {currentContent}
          </div>
        )}

        <div
          style={{
            paddingTop: hasTopGap ? `${contentHeight + 20}px` : "0px",
          }}
        />

        {children}
      </div>
    </FixedTopContext.Provider>
  );
}

interface FixedTopContentProps {
  children: ReactNode;
  className?: string;
}

export function FixedTopContent({ children, className }: FixedTopContentProps) {
  const context = useContext(FixedTopContext);

  if (!context) {
    throw new Error(
      "FixedTopLayout.Content must be used within FixedTopLayout"
    );
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
