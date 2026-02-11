"use client";

import { getFestivals } from "@/actions/festival";
import { getAllMissions } from "@/actions/mission";
import type { FestivalData } from "@/types/dto/festival";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyCardData } from "../components/SurveyCard";
import { ITEMS_PER_PAGE } from "../constants";
import { calculateDaysLeft, formatDuration } from "../utils";

export type ContentItem =
  | { type: "project"; data: SurveyCardData }
  | { type: "festival"; data: FestivalData };

interface UseInfiniteContentProps {
  initialProjects: SurveyCardData[];
  initialFestivals: FestivalData[];
}

interface UseInfiniteContentReturn {
  projects: SurveyCardData[];
  festivals: FestivalData[];
  mixedContent: ContentItem[];
  isLoadingMore: boolean;
  hasNextPage: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteContent({
  initialProjects,
  initialFestivals,
}: UseInfiniteContentProps): UseInfiniteContentReturn {
  const observerRef = useRef<HTMLDivElement>(null);

  const [additionalProjects, setAdditionalProjects] = useState<SurveyCardData[]>([]);
  const [additionalFestivals, setAdditionalFestivals] = useState<FestivalData[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const missionCursorRef = useRef<string | undefined>(
    initialProjects.length >= ITEMS_PER_PAGE
      ? initialProjects[initialProjects.length - 1]?.id
      : undefined,
  );
  const festivalPageRef = useRef<number | undefined>(
    initialFestivals.length >= ITEMS_PER_PAGE ? 2 : undefined,
  );
  const hasMoreMissionsRef = useRef(initialProjects.length >= ITEMS_PER_PAGE);
  const hasMoreFestivalsRef = useRef(initialFestivals.length >= ITEMS_PER_PAGE);
  const isLoadingRef = useRef(false);

  const [hasNextPage, setHasNextPage] = useState(
    initialProjects.length >= ITEMS_PER_PAGE || initialFestivals.length >= ITEMS_PER_PAGE,
  );

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!hasMoreMissionsRef.current && !hasMoreFestivalsRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      if (hasMoreMissionsRef.current) {
        if (missionCursorRef.current) {
          try {
            const result = await getAllMissions({
              cursor: missionCursorRef.current,
              limit: ITEMS_PER_PAGE,
            });
            const newProjects = result.data.map(mission => ({
              id: mission.id,
              title: mission.title,
              description: mission.description ?? "",
              imageUrl: mission.imageUrl ?? "",
              duration: formatDuration(mission.estimatedMinutes),
              daysLeft: calculateDaysLeft(mission.deadline),
              reward: null,
              currentParticipants: 0,
              maxParticipants: mission.maxParticipants ?? 100,
              category: mission.category,
              createdAt: mission.createdAt.toISOString(),
              isActive: mission.isActive,
              deadline: mission.deadline?.toISOString() ?? null,
              startDate:
                (mission as unknown as { startDate?: Date }).startDate?.toISOString() ?? null,
            }));
            setAdditionalProjects(prev => [...prev, ...newProjects]);

            if (result.nextCursor) {
              missionCursorRef.current = result.nextCursor;
            } else {
              missionCursorRef.current = undefined;
              hasMoreMissionsRef.current = false;
            }
          } catch {
            hasMoreMissionsRef.current = false;
          }
        } else {
          hasMoreMissionsRef.current = false;
        }
      }

      if (hasMoreFestivalsRef.current) {
        if (festivalPageRef.current) {
          try {
            const result = await getFestivals({
              numOfRows: ITEMS_PER_PAGE,
              pageNo: festivalPageRef.current,
            });
            setAdditionalFestivals(prev => [...prev, ...result.data]);

            const totalPages = Math.ceil(result.totalCount / result.numOfRows);
            if (result.pageNo < totalPages) {
              festivalPageRef.current = result.pageNo + 1;
            } else {
              festivalPageRef.current = undefined;
              hasMoreFestivalsRef.current = false;
            }
          } catch {
            hasMoreFestivalsRef.current = false;
          }
        } else {
          hasMoreFestivalsRef.current = false;
        }
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
      setHasNextPage(hasMoreMissionsRef.current || hasMoreFestivalsRef.current);
    }
  }, []);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (
          entry?.isIntersecting &&
          !isLoadingRef.current &&
          (hasMoreMissionsRef.current || hasMoreFestivalsRef.current)
        ) {
          loadMore();
        }
      },
      { threshold: 0, rootMargin: "100px" },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [loadMore]);

  const projects = useMemo(
    () => [...initialProjects, ...additionalProjects],
    [initialProjects, additionalProjects],
  );

  const festivals = useMemo(
    () => [...initialFestivals, ...additionalFestivals],
    [initialFestivals, additionalFestivals],
  );

  const mixedContent: ContentItem[] = useMemo(() => {
    const projectItems: ContentItem[] = projects.map(project => ({
      type: "project",
      data: project,
    }));
    const festivalItems: ContentItem[] = festivals.map(festival => ({
      type: "festival",
      data: festival,
    }));

    const allItems = [...projectItems, ...festivalItems];

    allItems.sort((a, b) => {
      const dateA = a.type === "project" ? new Date(a.data.createdAt) : new Date(a.data.startDate);
      const dateB = b.type === "project" ? new Date(b.data.createdAt) : new Date(b.data.startDate);
      return dateB.getTime() - dateA.getTime();
    });

    return allItems;
  }, [projects, festivals]);

  return {
    projects,
    festivals,
    mixedContent,
    isLoadingMore,
    hasNextPage,
    observerRef,
  };
}
