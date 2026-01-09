"use client";

import gsap from "gsap";
import { ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { IconButton } from "./IconButton";

const MOBILE_BREAKPOINT = 768;
const SCROLL_SENSITIVITY = 1.2;
const SNAP_DEBOUNCE_MS = 200;

interface BottomDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  collapsedHeight: number;
  expandedHeight: number;
  progress: number;
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
  const [progress, setProgress] = React.useState(defaultOpen ? 1 : 0);
  const [calculatedExpandedHeight, setCalculatedExpandedHeight] = React.useState(400);

  const expandedHeight = expandedHeightProp ?? calculatedExpandedHeight;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!expandedHeightProp) {
      const updateHeight = () => {
        const viewportMaxHeight = window.innerHeight * 0.85;
        setCalculatedExpandedHeight(Math.min(window.innerHeight - 40, viewportMaxHeight));
      };
      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, [expandedHeightProp]);

  const open = React.useCallback(() => {
    setIsOpen(true);
    setProgress(1);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    setProgress(0);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = React.useCallback(() => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    setProgress(newValue ? 1 : 0);
    onOpenChange?.(newValue);
  }, [isOpen, onOpenChange]);

  const value = React.useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      collapsedHeight,
      expandedHeight,
      progress,
    }),
    [isOpen, open, close, toggle, collapsedHeight, expandedHeight, progress],
  );

  return <BottomDrawerContext.Provider value={value}>{children}</BottomDrawerContext.Provider>;
}

interface BottomDrawerContentProps {
  className?: string;
  children: React.ReactNode;
  enableDrag?: boolean;
  enableWheelControl?: boolean;
  clickToExpand?: boolean;
  preventBodyScroll?: boolean;
}

function BottomDrawerContent({
  className,
  children,
  enableDrag = true,
  enableWheelControl = false,
  clickToExpand = false,
  preventBodyScroll = false,
}: BottomDrawerContentProps) {
  const { isOpen, open, close, collapsedHeight, expandedHeight } = useBottomDrawer();

  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const heightDiff = expandedHeight - collapsedHeight;

  const currentY = React.useRef(0);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Touch drag state
  const isDraggingRef = React.useRef(false);
  const startY = React.useRef(0);
  const wasOpenOnDragStart = React.useRef(false);

  // Snap timeout for debouncing
  const snapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // RAF for throttling
  const rafRef = React.useRef<number | null>(null);
  const pendingDeltaRef = React.useRef(0);
  const lastWheelIntentRef = React.useRef<"open" | "close" | null>(null);

  // Skip animation flag for scroll-based state updates
  const skipAnimationRef = React.useRef(false);

  // Set initial position immediately (no animation)
  React.useLayoutEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const targetY = isOpen ? 0 : heightDiff;

    // First time: just set position
    if (!isInitialized) {
      drawer.style.transform = `translate3d(0, ${targetY}px, 0)`;
      currentY.current = targetY;
      setIsInitialized(true);
      return;
    }

    // After init, if heightDiff changed and drawer is closed, update position silently
    if (!isOpen && Math.abs(currentY.current - targetY) > 1) {
      drawer.style.transform = `translate3d(0, ${targetY}px, 0)`;
      currentY.current = targetY;
    }
  }, [isOpen, heightDiff, isInitialized]);

  // Animate drawer position when isOpen changes
  React.useEffect(() => {
    if (!isInitialized) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const targetY = isOpen ? 0 : heightDiff;

    // Only animate if position actually needs to change
    if (Math.abs(currentY.current - targetY) > 1) {
      drawer.style.transition = "transform 0.3s ease-out";
      drawer.style.transform = `translate3d(0, ${targetY}px, 0)`;
      currentY.current = targetY;

      setTimeout(() => {
        if (drawer) drawer.style.transition = "";
      }, 300);
    }
  }, [isOpen, heightDiff, isInitialized]);

  // Check if mobile (use touch capability, not just screen width)
  React.useEffect(() => {
    const checkMobile = () => {
      const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(hasTouchScreen && isNarrow);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll on mobile when drawer is mounted (optional)
  React.useEffect(() => {
    if (!preventBodyScroll || !isMobile) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Prevent body/html scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [preventBodyScroll, isMobile]);

  // Get scrollable element
  const getScrollable = React.useCallback(() => {
    return drawerRef.current?.querySelector("[data-drawer-scrollable]") as HTMLElement | null;
  }, []);

  // Snap to open or close
  const snapTo = React.useCallback(
    (toOpen: boolean) => {
      const targetY = toOpen ? 0 : heightDiff;
      gsap.to(drawerRef.current, {
        y: targetY,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          currentY.current = targetY;
          if (toOpen) open();
          else close();
        },
      });
    },
    [heightDiff, open, close],
  );

  // Store values in refs to avoid stale closures
  const isMobileRef = React.useRef(isMobile);
  const heightDiffRef = React.useRef(heightDiff);
  const openRef = React.useRef(open);
  const closeRef = React.useRef(close);

  React.useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  React.useEffect(() => {
    heightDiffRef.current = heightDiff;
  }, [heightDiff]);

  React.useEffect(() => {
    openRef.current = open;
    closeRef.current = close;
  }, [open, close]);

  // PC: Wheel scroll control - listener attached once
  React.useEffect(() => {
    if (!enableWheelControl) return;

    const updateDrawerPosition = () => {
      const drawer = drawerRef.current;
      if (!drawer) return;

      const hDiff = heightDiffRef.current;
      const delta = pendingDeltaRef.current;
      pendingDeltaRef.current = 0;
      rafRef.current = null;

      if (delta === 0) return;

      // Kill any ongoing GSAP animation to prevent conflicts
      gsap.killTweensOf(drawer);

      const newY = Math.min(hDiff, Math.max(0, currentY.current - delta));
      currentY.current = newY;

      // Use direct style for better performance during scroll
      drawer.style.transform = `translate3d(0, ${newY}px, 0)`;

      // Update open/close state without snapping animation
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        // Snap based on last scroll intent
        const shouldBeOpen = lastWheelIntentRef.current === "open";
        // Set flag to skip animation when state changes
        skipAnimationRef.current = true;
        if (shouldBeOpen) openRef.current();
        else closeRef.current();
      }, SNAP_DEBOUNCE_MS);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isMobileRef.current) return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const scrollable = getScrollable();
      const isFullyOpen = currentY.current <= 1;

      // When fully open, check if we should scroll content or close drawer
      if (isFullyOpen && scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;
        const scrollingUp = e.deltaY < 0;
        const scrollingDown = e.deltaY > 0;

        if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
          return;
        }

        if (atTop && scrollingUp) {
          e.preventDefault();
          pendingDeltaRef.current += e.deltaY * SCROLL_SENSITIVITY;
          lastWheelIntentRef.current = "close";
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(updateDrawerPosition);
          }
          return;
        }

        return;
      }

      // Drawer not fully open -> control drawer position
      e.preventDefault();
      pendingDeltaRef.current += e.deltaY * SCROLL_SENSITIVITY;
      lastWheelIntentRef.current = e.deltaY > 0 ? "open" : "close";

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateDrawerPosition);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableWheelControl, getScrollable]);

  // Track if touch started in scrollable area
  const touchInScrollableRef = React.useRef(false);

  // Mobile: Touch drag (same logic as wheel)
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !enableDrag) return;
    const touch = e.touches[0];
    if (!touch) return;

    // Check if touch started inside scrollable area when drawer is fully open
    const scrollable = getScrollable();
    const isFullyOpen = currentY.current <= 1;

    if (isFullyOpen && scrollable && scrollable.contains(e.target as Node)) {
      // Mark that touch started in scrollable area
      touchInScrollableRef.current = true;
      isDraggingRef.current = false;
      startY.current = touch.clientY;
      wasOpenOnDragStart.current = true;
      return;
    }

    touchInScrollableRef.current = false;
    isDraggingRef.current = true;
    startY.current = touch.clientY;
    wasOpenOnDragStart.current = currentY.current < heightDiff * 0.5;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !enableDrag) return;
    const touch = e.touches[0];
    if (!touch) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Calculate incremental delta (like wheel)
    // Positive delta = finger up = scroll down (like wheel deltaY > 0)
    // Negative delta = finger down = scroll up (like wheel deltaY < 0)
    const delta = startY.current - touch.clientY;
    startY.current = touch.clientY;

    const scrollable = getScrollable();

    // Touch started in scrollable area - check if we should transition to drawer control
    if (touchInScrollableRef.current && scrollable) {
      const atTop = scrollable.scrollTop <= 0;
      const scrollingUp = delta < 0; // finger down = scroll up (trying to close)

      // At top and trying to scroll up more → start controlling drawer to close it
      if (atTop && scrollingUp) {
        isDraggingRef.current = true;
        touchInScrollableRef.current = false;
        gsap.killTweensOf(drawer);
        const newY = Math.min(
          heightDiff,
          Math.max(0, currentY.current - delta * SCROLL_SENSITIVITY),
        );
        currentY.current = newY;
        drawer.style.transform = `translate3d(0, ${newY}px, 0)`;
      }
      // Otherwise, let native scroll happen (do nothing)
      return;
    }

    // Normal drag mode
    if (!isDraggingRef.current) return;

    const isFullyOpen = currentY.current <= 1;

    // When fully open, check if we should scroll content or close drawer (same as wheel)
    if (isFullyOpen && scrollable) {
      const atTop = scrollable.scrollTop <= 0;
      const atBottom =
        scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;
      const scrollingUp = delta < 0; // finger down = scroll up
      const scrollingDown = delta > 0; // finger up = scroll down

      // If can scroll content, let it scroll naturally
      if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
        return;
      }

      // At top and trying to scroll up more → control drawer to close it
      if (atTop && scrollingUp) {
        gsap.killTweensOf(drawer);
        const newY = Math.min(
          heightDiff,
          Math.max(0, currentY.current - delta * SCROLL_SENSITIVITY),
        );
        currentY.current = newY;
        drawer.style.transform = `translate3d(0, ${newY}px, 0)`;
        return;
      }

      // Otherwise, don't control drawer
      return;
    }

    // Drawer not fully open → control drawer position
    gsap.killTweensOf(drawer);
    const newY = Math.min(heightDiff, Math.max(0, currentY.current - delta * SCROLL_SENSITIVITY));
    currentY.current = newY;
    drawer.style.transform = `translate3d(0, ${newY}px, 0)`;
  };

  const onTouchEnd = () => {
    if (!isMobile) return;

    // Reset touch in scrollable flag
    touchInScrollableRef.current = false;

    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Snap to open or closed with CSS transition
    // Very sensitive: any movement in the opposite direction triggers snap
    // If was open and moved down at all → close
    // If was closed and moved up at all → open
    const movedDown = currentY.current > heightDiff * 0.02;
    const movedUp = currentY.current < heightDiff * 0.98;
    const shouldBeOpen = wasOpenOnDragStart.current ? !movedDown : movedUp;
    const targetY = shouldBeOpen ? 0 : heightDiff;

    // Enable CSS transition for snap
    drawer.style.transition = "transform 0.3s ease-out";
    drawer.style.transform = `translate3d(0, ${targetY}px, 0)`;
    currentY.current = targetY;

    // Remove transition after animation completes
    setTimeout(() => {
      if (drawer) drawer.style.transition = "";
    }, 300);

    skipAnimationRef.current = true;
    if (shouldBeOpen) open();
    else close();
  };

  // Click to expand
  const onClick = () => {
    if (isMobile || !clickToExpand || isOpen) return;
    snapTo(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={drawerRef}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background rounded-t-lg shadow-lg",
        "flex flex-col overflow-hidden",
        "mx-auto max-w-lg",
        className,
      )}
      style={{
        height: expandedHeight,
        willChange: "transform",
      }}
    >
      <div className="flex flex-col h-full">{children}</div>
    </div>
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
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        toggle();
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
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) {
        onClick(e as unknown as React.MouseEvent);
      }
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between", className)}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 w-full h-full">{children}</div>
      {showToggleButton && (
        <IconButton
          icon={ChevronUp}
          onClick={toggle}
          aria-label={isOpen ? "접기" : "펼치기"}
          className={cn("transition-transform p-0", isOpen && "rotate-180")}
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
  return (
    <div
      data-drawer-scrollable
      className={cn("flex-1 overflow-y-auto px-5 py-4", className)}
      style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
    >
      {children}
    </div>
  );
}

interface BottomDrawerFooterProps {
  className?: string;
  children: React.ReactNode;
}

function BottomDrawerFooter({ className, children }: BottomDrawerFooterProps) {
  return <div className={cn("px-5 py-4 bg-background", className)}>{children}</div>;
}

export const BottomDrawer = Object.assign(BottomDrawerProvider, {
  Content: BottomDrawerContent,
  Trigger: BottomDrawerTrigger,
  Header: BottomDrawerHeader,
  Body: BottomDrawerBody,
  Footer: BottomDrawerFooter,
});
