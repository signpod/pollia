import { useEffect, useRef, useState } from "react";
import { SECTION_IDS } from "../../constants/sectionIds";

const getScrollOffset = (sectionId: string) => {
  if (sectionId === SECTION_IDS.MISSION_GUIDE) {
    return 60;
  }
  return 30;
};

interface UseStickyTabHeaderOptions {
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  hasReward: boolean;
}

export function useStickyTabHeader({ sentinelRef, hasReward }: UseStickyTabHeaderOptions) {
  const [activeTab, setActiveTab] = useState<
    (typeof SECTION_IDS)[keyof typeof SECTION_IDS] | undefined
  >(SECTION_IDS.MISSION_GUIDE);
  const [isSticky, setIsSticky] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const sentinelElement = sentinelRef?.current;
    if (!sentinelElement) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          setIsSticky(!entry.isIntersecting);
          setHasMounted(true);
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 0px 0px",
      },
    );

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [sentinelRef]);

  useEffect(() => {
    const missionGuideEl = document.getElementById(SECTION_IDS.MISSION_GUIDE);
    const rewardEl = document.getElementById(SECTION_IDS.REWARD);

    const visibilityMap = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      entries => {
        if (isUserScrollingRef.current) return;

        for (const entry of entries) {
          visibilityMap.set(entry.target.id, entry.isIntersecting);
        }

        const visibleSections = Array.from(visibilityMap.entries())
          .filter(([, isVisible]) => isVisible)
          .map(([id]) => id);

        if (isSticky) {
          if (visibleSections.length === 0) {
            setActiveTab(SECTION_IDS.MISSION_GUIDE);
          } else {
            setActiveTab(visibleSections[0] as (typeof SECTION_IDS)[keyof typeof SECTION_IDS]);
          }
        }
      },
      {
        rootMargin: "-80px 0px -85% 0px",
        threshold: 0,
      },
    );

    if (missionGuideEl) observer.observe(missionGuideEl);
    if (rewardEl && hasReward) observer.observe(rewardEl);

    return () => observer.disconnect();
  }, [isSticky, hasReward]);

  const handleChangeTab = (value: string) => {
    if (value !== SECTION_IDS.MISSION_GUIDE && value !== SECTION_IDS.REWARD) {
      return;
    }

    isUserScrollingRef.current = true;
    setActiveTab(value);

    const stickyScrollTop = window.innerHeight + 10;

    if (value === SECTION_IDS.MISSION_GUIDE) {
      window.scrollTo({ top: stickyScrollTop, behavior: "smooth" });
    } else {
      const element = document.getElementById(value);
      if (element) {
        const offset = getScrollOffset(value);
        const elementRect = element.getBoundingClientRect();
        const targetScrollTop = window.scrollY + elementRect.top - offset;
        window.scrollTo({
          top: Math.max(targetScrollTop, stickyScrollTop),
          behavior: "smooth",
        });
      }
    }

    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 500);
  };

  return {
    activeTab,
    isSticky: hasMounted && isSticky,
    handleChangeTab,
  };
}
