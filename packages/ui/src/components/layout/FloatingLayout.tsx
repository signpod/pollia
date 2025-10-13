"use client";

import { cn } from "../../lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useLayoutEffect,
} from "react";

interface FloatingPosition {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
}

interface FloatingContextType {
  currentContent: ReactNode | null;
  position: FloatingPosition;
  contentClassName: string;
  setContent: (
    content: ReactNode,
    position: FloatingPosition,
    className: string
  ) => void;
  clearContent: () => void;
}

const FloatingContext = createContext<FloatingContextType | null>(null);

interface FloatingLayoutProps {
  children: ReactNode;
  className?: string;
}

export function FloatingLayout({ children, className }: FloatingLayoutProps) {
  const [currentContent, setCurrentContent] = useState<ReactNode | null>(null);
  const [position, setPosition] = useState<FloatingPosition>({});
  const [contentClassName, setContentClassName] = useState<string>("");

  const setContent = (
    content: ReactNode,
    position: FloatingPosition,
    className: string
  ) => {
    setCurrentContent(content);
    setPosition(position);
    setContentClassName(className);
  };

  const clearContent = () => {
    setCurrentContent(null);
    setPosition({});
    setContentClassName("");
  };

  const positionStyles: React.CSSProperties = {
    top:
      position.top !== undefined
        ? typeof position.top === "number"
          ? `${position.top}px`
          : position.top
        : undefined,
    bottom:
      position.bottom !== undefined
        ? typeof position.bottom === "number"
          ? `${position.bottom}px`
          : position.bottom
        : undefined,
    left:
      position.left !== undefined
        ? typeof position.left === "number"
          ? `${position.left}px`
          : position.left
        : undefined,
    right:
      position.right !== undefined
        ? typeof position.right === "number"
          ? `${position.right}px`
          : position.right
        : undefined,
  };

  return (
    <FloatingContext.Provider
      value={{
        currentContent,
        position,
        contentClassName,
        setContent,
        clearContent,
      }}
    >
      <div className={cn("relative", className)}>
        {children}

        {currentContent && (
          <div
            className={cn(
              "fixed z-30",
              "max-w-lg mx-auto",
              "transition-all duration-300 ease-in-out",
              contentClassName
            )}
            style={positionStyles}
          >
            {currentContent}
          </div>
        )}
      </div>
    </FloatingContext.Provider>
  );
}

interface FloatingContentProps {
  children: ReactNode;
  position?: FloatingPosition;
  className?: string;
}

export function FloatingContent({
  children,
  position = { bottom: 20, right: 20 },
  className = "",
}: FloatingContentProps) {
  const context = useContext(FloatingContext);

  if (!context) {
    throw new Error("FloatingContent must be used within FloatingLayout");
  }

  const { setContent, clearContent } = context;

  useLayoutEffect(() => {
    setContent(children, position, className);

    return () => {
      clearContent();
    };
  }, [children, position, className, setContent, clearContent]);

  return null;
}
