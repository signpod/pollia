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
}

function BottomDrawerContent({
  className,
  children,
  enableDrag = true,
  enableWheelControl = false,
  clickToExpand = false,
}: BottomDrawerContentProps) {
  const { isOpen, open, close, collapsedHeight, expandedHeight } = useBottomDrawer();

  const drawerRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const currentY = React.useRef(0);
  const heightDiff = expandedHeight - collapsedHeight;

  // Touch drag state
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startDrawerY = React.useRef(0);

  // Snap timeout for debouncing
  const snapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // RAF for throttling
  const rafRef = React.useRef<number | null>(null);
  const pendingDeltaRef = React.useRef(0);

  // Skip animation flag for scroll-based state updates
  const skipAnimationRef = React.useRef(false);

  // Animate drawer position when isOpen changes
  React.useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const targetY = isOpen ? 0 : heightDiff;

    // Skip animation if flag is set (from scroll)
    if (skipAnimationRef.current) {
      skipAnimationRef.current = false;
      return;
    }

    // Only animate if position actually needs to change
    if (Math.abs(currentY.current - targetY) > 1) {
      // Kill any ongoing animation first
      gsap.killTweensOf(drawer);

      gsap.to(drawer, {
        y: targetY,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          currentY.current = targetY;
        },
      });
    } else {
      currentY.current = targetY;
      drawer.style.transform = `translate3d(0, ${targetY}px, 0)`;
    }
  }, [isOpen, heightDiff]);

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
        const shouldBeOpen = currentY.current < hDiff * 0.5;
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

      const hDiff = heightDiffRef.current;
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
  }, [enableWheelControl, getScrollable, snapTo]);

  // Mobile: Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !enableDrag) return;
    const touch = e.touches[0];
    if (!touch) return;

    isDragging.current = true;
    startY.current = touch.clientY;
    startDrawerY.current = currentY.current;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging.current || !enableDrag) return;
    const touch = e.touches[0];
    if (!touch) return;

    const scrollable = getScrollable();
    const isFullyOpen = currentY.current <= 1;

    if (scrollable && isFullyOpen) {
      const atTop = scrollable.scrollTop <= 0;
      const delta = touch.clientY - startY.current;
      if (!atTop || delta <= 0) {
        isDragging.current = false;
        return;
      }
    }

    const delta = touch.clientY - startY.current;
    const newY = Math.min(heightDiff, Math.max(0, startDrawerY.current + delta));
    currentY.current = newY;

    // Use direct style for better performance during drag
    if (drawerRef.current) {
      gsap.killTweensOf(drawerRef.current);
      drawerRef.current.style.transform = `translate3d(0, ${newY}px, 0)`;
    }
  };

  const onTouchEnd = () => {
    if (!isMobile || !isDragging.current) return;
    isDragging.current = false;

    // Snap based on position
    const threshold = heightDiff * 0.5;
    snapTo(currentY.current < threshold);
  };

  // Click to expand
  const onClick = () => {
    if (isMobile || !clickToExpand || isOpen) return;
    snapTo(true);
  };

  return (
    <div
      ref={drawerRef}
      onClick={onClick}
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
      style={{ height: expandedHeight, willChange: "transform" }}
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

  return (
    <div className={cn("flex items-center justify-between", className)} onClick={onClick}>
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
      style={{ overscrollBehavior: "contain" }}
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
