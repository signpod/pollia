"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

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
}>({
  activeTab: undefined,
});

interface TabRootProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  initialTab?: string;
}

function TabRoot({
  children,
  initialTab,
  defaultValue,
  ...props
}: TabRootProps) {
  const [activeTab, setActiveTab] = React.useState<string | undefined>(
    initialTab || defaultValue
  );

  return (
    <TabContext.Provider value={{ activeTab }}>
      <TabsPrimitive.Root
        defaultValue={initialTab || defaultValue}
        onValueChange={setActiveTab}
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
    setActiveTab: (value: string) => {
      // Radix UI에서는 프로그래매틱하게 탭을 변경하려면
      // Tabs.Root의 value prop을 controlled로 사용해야 합니다
      console.warn("setActiveTab is not supported with Radix UI Tabs. Use controlled mode with value prop instead.");
    },
  };
}

const TabList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative flex w-full items-center border-b border-gray-200",
      className
    )}
    {...props}
  />
));
TabList.displayName = TabsPrimitive.List.displayName;

interface TabItemProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string;
}

const TabItem = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabItemProps
>(({ children, value, className, ...props }, ref) => {
  const { activeTab } = React.useContext(TabContext);
  const isActive = activeTab === value;

  const tabItemVariants = cva(
    "relative px-4 py-3 flex-1 text-center select-none transition-colors",
    {
      variants: {
        isActive: {
          true: "text-primary",
          false: "text-zinc-500",
        },
      },
    }
  );

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        tabItemVariants({ isActive }),
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          layoutId="activeTab"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </TabsPrimitive.Trigger>
  );
});
TabItem.displayName = "TabItem";

const TabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
      className
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
