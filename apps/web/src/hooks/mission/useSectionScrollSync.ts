import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseSectionScrollSyncOptions {
  sections: string[];
  defaultSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export function useSectionScrollSync({
  sections,
  defaultSection = sections[0] ?? "",
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

  const handleChangeTab = useCallback((value: string) => {
    setActiveTab(value);
    isScrollingRef.current = true;
    const element = document.getElementById(value);
    if (element) {
      window.history.pushState(null, "", `#${value}`);
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  }, []);

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
        const isTopNearViewport = rect.top >= 0 && rect.top <= 100;
        const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight;

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
  }, [activeTab, sectionsKey, onSectionChange]);

  return {
    activeTab,
    handleChangeTab,
  };
}

export type UseSectionScrollSyncReturn = ReturnType<typeof useSectionScrollSync>;
