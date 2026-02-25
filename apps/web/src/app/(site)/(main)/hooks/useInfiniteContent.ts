"use client";

import { getAllMissions } from "@/actions/mission";
import { MissionType } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyCardData } from "../components/SurveyCard";
import { ITEMS_PER_PAGE } from "../constants";
import { calculateDaysLeft, formatDuration } from "../utils";

export type ContentItem = { type: "project"; data: SurveyCardData };

interface UseInfiniteContentProps {
  initialProjects: SurveyCardData[];
}

interface UseInfiniteContentReturn {
  projects: SurveyCardData[];
  mixedContent: ContentItem[];
  isLoadingMore: boolean;
  hasNextPage: boolean;
  observerRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteContent({
  initialProjects,
}: UseInfiniteContentProps): UseInfiniteContentReturn {
  const observerRef = useRef<HTMLDivElement>(null);

  const [additionalProjects, setAdditionalProjects] = useState<SurveyCardData[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const missionCursorRef = useRef<string | undefined>(
    initialProjects.length >= ITEMS_PER_PAGE
      ? initialProjects[initialProjects.length - 1]?.id
      : undefined,
  );
  const hasMoreMissionsRef = useRef(initialProjects.length >= ITEMS_PER_PAGE);
  const isLoadingRef = useRef(false);

  const [hasNextPage, setHasNextPage] = useState(initialProjects.length >= ITEMS_PER_PAGE);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!hasMoreMissionsRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      if (missionCursorRef.current) {
        try {
          const result = await getAllMissions({
            cursor: missionCursorRef.current,
            limit: ITEMS_PER_PAGE,
            type: MissionType.GENERAL,
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
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
      setHasNextPage(hasMoreMissionsRef.current);
    }
  }, []);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoadingRef.current && hasMoreMissionsRef.current) {
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

  const mixedContent: ContentItem[] = useMemo(
    () =>
      projects.map(project => ({
        type: "project" as const,
        data: project,
      })),
    [projects],
  );

  return {
    projects,
    mixedContent,
    isLoadingMore,
    hasNextPage,
    observerRef,
  };
}
