import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ScrollOffsetValue = number | ((sectionId: string) => number);

function getScrollOffset(scrollOffset: ScrollOffsetValue, sectionId: string): number {
  return typeof scrollOffset === "function" ? scrollOffset(sectionId) : scrollOffset;
}

interface UseSectionScrollSyncOptions {
  sections: string[];
  defaultSection?: string;
  scrollOffset?: ScrollOffsetValue;
  onSectionChange?: (sectionId: string) => void;
}

export function useSectionScrollSync({
  sections,
  defaultSection = sections[0] ?? "",
  scrollOffset = 0,
  onSectionChange,
}: UseSectionScrollSyncOptions) {
  const sectionsKey = useMemo(() => sections.join(","), [sections]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (hash && sections.includes(hash)) {
        return hash;
      }
    }
    return defaultSection;
  });
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalledRef = useRef<{ value: string; timestamp: number } | null>(null);

  const handleChangeTab = useCallback(
    (value: string) => {
      const now = Date.now();
      const lastCalled = lastCalledRef.current;

      if (
        lastCalled &&
        lastCalled.value === value &&
        now - lastCalled.timestamp < 100
      ) {
        return;
      }

      lastCalledRef.current = { value, timestamp: now };

      const element = document.getElementById(value);
      if (!element) return;

      const offset = getScrollOffset(scrollOffset, value);
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const targetScrollPosition = elementPosition - offset;
      const currentScrollPosition = window.scrollY;
      const scrollDifference = Math.abs(targetScrollPosition - currentScrollPosition);

      if (scrollDifference > 1) {
        setActiveTab(value);
        isScrollingRef.current = true;
        window.history.pushState(null, "", `#${value}`);

        window.scrollTo({
          top: targetScrollPosition,
          behavior: "smooth",
        });

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      } else if (value !== activeTab) {
        setActiveTab(value);
        window.history.pushState(null, "", `#${value}`);
      }
    },
    [activeTab, scrollOffset],
  );

  useEffect(() => {
    const sectionsList = sectionsKey.split(",");
    const sectionElements: Map<string, HTMLElement> = new Map();

    sectionsList.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        sectionElements.set(sectionId, element);
      }
    });

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const viewportHeight = window.innerHeight;

      let foundSection: { id: string; element: HTMLElement } | null = null;

      for (const [sectionId, element] of sectionElements) {
        const rect = element.getBoundingClientRect();
        const offset = getScrollOffset(scrollOffset, sectionId);
        const adjustedTop = rect.top - offset;
        const isTopNearViewport = adjustedTop >= -50 && adjustedTop <= 50;
        const isFullyVisible = adjustedTop >= 0 && rect.bottom <= viewportHeight;

        if (isTopNearViewport || isFullyVisible) {
          foundSection = { id: sectionId, element };
          break;
        }
      }

      if (foundSection && foundSection.id !== activeTab) {
        setActiveTab(foundSection.id);
        window.history.pushState(null, "", `#${foundSection.id}`);
        onSectionChange?.(foundSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeTab, sectionsKey, scrollOffset, onSectionChange]);

  return {
    activeTab,
    handleChangeTab,
  };
}

export type UseSectionScrollSyncReturn = ReturnType<typeof useSectionScrollSync>;
