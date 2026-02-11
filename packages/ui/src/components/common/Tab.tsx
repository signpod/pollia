"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Tab Component with Full Accessibility Support (Radix UI)
 *
 * 웹 접근성 기능:
 * - ARIA 속성 자동 적용 (aria-selected, role="tablist", role="tab")
 * - 키보드 네비게이션 (ArrowLeft, ArrowRight, Home, End)
 * - 포커스 관리 및 자동 활성화
 * - 스크린 리더 완벽 지원
 *
 * @example
 * ```tsx
 * <Tab.Root initialTab="tab1">
 *   <Tab.List>
 *     <Tab.Item value="tab1">Tab 1</Tab.Item>
 *     <Tab.Item value="tab2">Tab 2</Tab.Item>
 *   </Tab.List>
 * </Tab.Root>
 * ```
 */

// Context for active tab tracking (for animations)
const TabContext = React.createContext<{
  activeTab: string | undefined;
  pointColor: "primary" | "secondary";
  isInitialRender: boolean;
  scrollable: boolean;
}>({
  activeTab: undefined,
  pointColor: "primary",
  isInitialRender: true,
  scrollable: false,
});

interface TabRootProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  initialTab?: string;
  pointColor?: "primary" | "secondary";
  scrollable?: boolean;
}

function TabRoot({
  children,
  initialTab,
  defaultValue,
  value,
  pointColor = "primary",
  scrollable = false,
  onValueChange,
  ...props
}: TabRootProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState<string | undefined>(
    initialTab || defaultValue,
  );
  const [isInitialRender, setIsInitialRender] = React.useState(true);
  const activeTab = value !== undefined ? value : internalActiveTab;

  React.useEffect(() => {
    setIsInitialRender(false);
  }, []);

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabContext.Provider value={{ activeTab, pointColor, isInitialRender, scrollable }}>
      <TabsPrimitive.Root
        value={value}
        defaultValue={initialTab || defaultValue}
        onValueChange={handleValueChange}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabContext.Provider>
  );
}

export function useTab() {
  const context = React.useContext(TabContext);

  return {
    activeTab: context.activeTab || null,
    setActiveTab: (_value: string) => {
      // Radix UI에서는 프로그래매틱하게 탭을 변경하려면
      // Tabs.Root의 value prop을 controlled로 사용해야 합니다
      console.warn(
        "setActiveTab is not supported with Radix UI Tabs. Use controlled mode with value prop instead.",
      );
    },
  };
}

const TabList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const { activeTab, pointColor, isInitialRender } = React.useContext(TabContext);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  React.useEffect(() => {
    const list = innerRef.current;
    if (!list || !activeTab) return;

    const activeEl = list.querySelector<HTMLElement>('[data-state="active"]');
    if (!activeEl) return;

    setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [activeTab]);

  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  return (
    <TabsPrimitive.List
      ref={mergedRef}
      className={cn("relative flex w-full items-center border-b border-gray-200", className)}
      {...props}
    >
      {children}
      {indicator.width > 0 && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-0.5",
            pointColor === "primary" ? "bg-primary" : "bg-black",
          )}
          initial={false}
          animate={{ x: indicator.left }}
          style={{ width: indicator.width }}
          transition={
            isInitialRender
              ? { duration: 0 }
              : { type: "tween", duration: 0.25, ease: "easeInOut" }
          }
        />
      )}
    </TabsPrimitive.List>
  );
});
TabList.displayName = TabsPrimitive.List.displayName;

interface TabItemProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string;
  pointColor?: "primary" | "secondary";
}

const TabItem = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabItemProps>(
  ({ children, value, className, ...props }, ref) => {
    const { activeTab, pointColor, scrollable } = React.useContext(TabContext);
    const isActive = activeTab === value;

    const tabItemVariants = cva(
      cn("relative px-4 py-3 text-center select-none transition-colors", scrollable ? "shrink-0" : "flex-1"),
      {
        variants: {
          isActive: {
            true: "",
            false: "text-zinc-500",
          },
        },
      },
    );

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        className={cn(
          tabItemVariants({ isActive }),
          isActive && (pointColor === "primary" ? "text-violet-500" : "text-black"),
          "cursor-pointer overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    );
  },
);
TabItem.displayName = "TabItem";

const TabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabContent.displayName = TabsPrimitive.Content.displayName;

export const Tab = {
  Root: TabRoot,
  List: TabList,
  Item: TabItem,
  Content: TabContent,
};
