"use client";

import { getUserSurveys } from "@/actions/survey/read";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { ADMIN_ROUTES } from "../constants/routes";
import { Button } from "./shadcn-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./shadcn-ui/card";
import { Skeleton } from "./shadcn-ui/skeleton";

export function SurveyList() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit: 10,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const surveys = data?.pages.flatMap(page => page.data) ?? [];

  if (isLoading) {
    return <SurveyListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href={ADMIN_ROUTES.ADMIN_SURVEY_CREATE}>
          <Card className="h-[180px] border-dashed border-2 hover:border-primary hover:bg-muted/30 transition-shadow cursor-pointer group">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="size-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">새 설문조사 만들기</p>
                <p className="text-sm text-muted-foreground">클릭하여 설문조사를 생성하세요</p>
              </div>
            </div>
          </Card>
        </Link>
        {surveys.map(survey => (
          <Card
            key={survey.id}
            className="h-[180px] hover:shadow-md hover:bg-muted/30 transition-shadow cursor-pointer"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{survey.title}</CardTitle>
              {survey.description && (
                <CardDescription className="line-clamp-2">
                  {survey.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                <span>
                  {formatDistanceToNow(new Date(survey.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  );
}

function SurveyListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
