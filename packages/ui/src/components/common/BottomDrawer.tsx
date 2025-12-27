"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { IconButton } from "./IconButton";

interface BottomDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  collapsedHeight: number;
  expandedHeight: number | null;
  setExpandedHeight: (height: number) => void;
}

const BottomDrawerContext = React.createContext<BottomDrawerContextType | undefined>(undefined);

export const useBottomDrawer = () => {
  const context = React.useContext(BottomDrawerContext);
  if (!context) {
    throw new Error("useBottomDrawer must be used within a BottomDrawerProvider");
  }
  return context;
};

interface BottomDrawerProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsedHeight?: number;
  expandedHeight?: number;
  onOpenChange?: (isOpen: boolean) => void;
}

function BottomDrawerProvider({
  children,
  defaultOpen = false,
  collapsedHeight = 80,
  expandedHeight: expandedHeightProp,
  onOpenChange,
}: BottomDrawerProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [expandedHeight, setExpandedHeight] = React.useState<number | null>(
    expandedHeightProp ?? null,
  );

  const open = React.useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = React.useCallback(() => {
    setIsOpen(prev => {
      const newValue = !prev;
      onOpenChange?.(newValue);
      return newValue;
    });
  }, [onOpenChange]);

  const value = React.useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      collapsedHeight,
      expandedHeight: expandedHeightProp ?? expandedHeight,
      setExpandedHeight,
    }),
    [isOpen, open, close, toggle, collapsedHeight, expandedHeightProp, expandedHeight],
  );

  return <BottomDrawerContext.Provider value={value}>{children}</BottomDrawerContext.Provider>;
}

interface BottomDrawerContentProps {
  className?: string;
  children: React.ReactNode;
  enableDrag?: boolean;
  dragThreshold?: number;
  clickToExpand?: boolean;
}

function BottomDrawerContent({
  className,
  children,
  enableDrag = true,
  dragThreshold = 50,
  clickToExpand = true,
}: BottomDrawerContentProps) {
  const { isOpen, open, close, collapsedHeight, expandedHeight, setExpandedHeight } =
    useBottomDrawer();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [calculatedExpandedHeight, setCalculatedExpandedHeight] = React.useState(
    expandedHeight ?? collapsedHeight,
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (contentRef.current && !expandedHeight && typeof window !== "undefined" && mounted) {
      const updateHeight = () => {
        if (contentRef.current) {
          const element = contentRef.current;
          const originalHeight = element.style.height;
          const originalMinHeight = element.style.minHeight;

          element.style.height = "auto";
          element.style.minHeight = "auto";

          const height = element.scrollHeight;

          element.style.height = originalHeight;
          element.style.minHeight = originalMinHeight;

          const maxHeight = window.innerHeight * 0.85;
          const finalHeight = Math.max(height, collapsedHeight);
          const clampedHeight = Math.min(finalHeight, maxHeight);
          setCalculatedExpandedHeight(clampedHeight);
          setExpandedHeight(clampedHeight);
        }
      };

      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);

      return () => resizeObserver.disconnect();
    }
    if (expandedHeight) {
      setCalculatedExpandedHeight(expandedHeight);
    }
  }, [expandedHeight, collapsedHeight, setExpandedHeight, mounted]);

  const finalExpandedHeight = expandedHeight ?? calculatedExpandedHeight;
  const initialY = mounted
    ? isOpen
      ? 0
      : finalExpandedHeight - collapsedHeight
    : finalExpandedHeight - collapsedHeight;
  const y = useMotionValue(initialY);
  const springConfig = { damping: 40, stiffness: 400 };
  const springY = useSpring(y, springConfig);

  React.useEffect(() => {
    if (mounted) {
      y.set(isOpen ? 0 : finalExpandedHeight - collapsedHeight);
    }
  }, [isOpen, finalExpandedHeight, collapsedHeight, y, mounted]);

  const isDraggingRef = React.useRef(false);
  const dragEndTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = React.useCallback(() => {
    isDraggingRef.current = true;
    if (dragEndTimeoutRef.current) {
      clearTimeout(dragEndTimeoutRef.current);
      dragEndTimeoutRef.current = null;
    }
  }, []);

  const handleDragEnd = React.useCallback(
    (_event: PointerEvent, info: { offset: { y: number }; velocity: { y: number } }) => {
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;

      if (!wasDragging) return;

      const currentY = y.get();
      const maxDragOffset = finalExpandedHeight - collapsedHeight;
      const snapThreshold = maxDragOffset * 0.1;

      const velocityThreshold = 100;
      const hasSignificantVelocity = Math.abs(info.velocity.y) > velocityThreshold;

      if (hasSignificantVelocity) {
        if (info.velocity.y > 0) {
          close();
        } else {
          open();
        }
      } else {
        if (isOpen) {
          const shouldClose = currentY > snapThreshold;
          if (shouldClose) {
            close();
          } else {
            y.set(0);
          }
        } else {
          const shouldOpen = currentY < maxDragOffset - snapThreshold;
          if (shouldOpen) {
            open();
          } else {
            y.set(finalExpandedHeight - collapsedHeight);
          }
        }
      }

      dragEndTimeoutRef.current = setTimeout(() => {
        dragEndTimeoutRef.current = null;
      }, 100);
    },
    [isOpen, close, open, y, finalExpandedHeight, collapsedHeight],
  );

  React.useEffect(() => {
    return () => {
      if (dragEndTimeoutRef.current) {
        clearTimeout(dragEndTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (enableDrag) {
        return;
      }
      if (isDraggingRef.current || dragEndTimeoutRef.current) {
        return;
      }
      if (!isOpen && clickToExpand) {
        const target = e.target as HTMLElement;
        const isClickableElement =
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("textarea");

        const isTrigger = target.closest("[data-bottom-drawer-trigger]");

        if (!isClickableElement && !isTrigger) {
          e.stopPropagation();
          open();
        }
      }
    },
    [isOpen, clickToExpand, open, enableDrag],
  );

  const maxDragOffset = finalExpandedHeight - collapsedHeight;

  return (
    <motion.div
      style={{
        y: springY,
        height: finalExpandedHeight,
      }}
      drag={enableDrag ? "y" : false}
      dragConstraints={{ top: 0, bottom: maxDragOffset }}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background rounded-t-lg shadow-lg",
        "flex flex-col overflow-hidden",
        "mx-auto max-w-lg",
        !isOpen && clickToExpand && "cursor-pointer",
        className,
      )}
    >
      <div ref={contentRef} className="flex flex-col h-full pointer-events-auto">
        {children}
      </div>
    </motion.div>
  );
}

interface BottomDrawerTriggerProps {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

function BottomDrawerTrigger({ className, children, asChild }: BottomDrawerTriggerProps) {
  const { toggle, isOpen } = useBottomDrawer();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      "data-bottom-drawer-trigger": true,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const isClickableElement =
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("textarea");

        if (!isClickableElement) {
          toggle();
        }

        if (
          typeof children.props === "object" &&
          children.props !== null &&
          "onClick" in children.props
        ) {
          const onClick = children.props.onClick as ((e: React.MouseEvent) => void) | undefined;
          onClick?.(e);
        }
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        toggle();
      }}
      className={cn("flex items-center justify-center", className)}
      aria-label={isOpen ? "드로어 닫기" : "드로어 열기"}
    >
      {children}
    </button>
  );
}

interface BottomDrawerHeaderProps {
  className?: string;
  children: React.ReactNode;
  showToggleButton?: boolean;
  showCloseButton?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function BottomDrawerHeader({
  className,
  children,
  showToggleButton = true,
  showCloseButton = false,
  onClick,
}: BottomDrawerHeaderProps) {
  const { toggle, close, isOpen } = useBottomDrawer();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between", className)}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 w-full h-full">{children}</div>
      {showToggleButton && (
        <IconButton
          icon={ChevronUp}
          onClick={toggle}
          aria-label={isOpen ? "접기" : "펼치기"}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      )}
      {showCloseButton && (
        <IconButton icon={ChevronUp} onClick={close} aria-label="닫기" className="rotate-180" />
      )}
    </div>
  );
}

interface BottomDrawerBodyProps {
  className?: string;
  children: React.ReactNode;
}

function BottomDrawerBody({ className, children }: BottomDrawerBodyProps) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)}>{children}</div>;
}

interface BottomDrawerFooterProps {
  className?: string;
  children: React.ReactNode;
}

function BottomDrawerFooter({ className, children }: BottomDrawerFooterProps) {
  return <div className={cn("px-5 py-4", "bg-background", className)}>{children}</div>;
}

export const BottomDrawer = Object.assign(BottomDrawerProvider, {
  Content: BottomDrawerContent,
  Trigger: BottomDrawerTrigger,
  Header: BottomDrawerHeader,
  Body: BottomDrawerBody,
  Footer: BottomDrawerFooter,
});
