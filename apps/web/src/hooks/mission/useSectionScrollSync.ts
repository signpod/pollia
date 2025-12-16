import { useEffect, useRef, useState } from "react";

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

  const handleChangeTab = (value: string) => {
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
  };

  useEffect(() => {
    const sectionElements: Map<string, HTMLElement> = new Map();

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        sectionElements.set(sectionId, element);
      }
    });

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const viewportTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const sectionsData: Array<{ id: string; top: number; bottom: number; element: HTMLElement }> =
        [];

      sectionElements.forEach((element, sectionId) => {
        const rect = element.getBoundingClientRect();
        const top = rect.top + viewportTop;
        const bottom = top + rect.height;
        sectionsData.push({ id: sectionId, top, bottom, element });
      });

      const activeSection = sectionsData.find(section => {
        const rect = section.element.getBoundingClientRect();
        const isTopNearViewport = rect.top >= 0 && rect.top <= 100;
        const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
        return isTopNearViewport || isFullyVisible;
      });

      if (activeSection && activeSection.id !== activeTab) {
        setActiveTab(activeSection.id);
        window.history.pushState(null, "", `#${activeSection.id}`);
        onSectionChange?.(activeSection.id);
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
  }, [activeTab, sections, onSectionChange]);

  return {
    activeTab,
    handleChangeTab,
  };
}
