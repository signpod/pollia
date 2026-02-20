import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { formatMillisecondsToKorean } from "@/lib/utils";
import type { MissionFunnelData } from "@/types/dto";
import type { MissionStats } from "@/types/mission-stats";
import { CheckCircle2, Clock, PlayCircle, Target, UserCheck, Users } from "lucide-react";

interface MissionFunnelTextViewProps {
  metadata: MissionFunnelData["metadata"];
  missionStats: MissionStats;
}

export function MissionFunnelTextView({ metadata, missionStats }: MissionFunnelTextViewProps) {
  if (!metadata) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">유효하지 않은 데이터입니다</p>
      </div>
    );
  }

  if (metadata.totalStarted === 0 && missionStats.total === 0) {
    return (
      <div className="h-[450px] w-full flex items-center justify-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">아직 참여한 사용자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">
              {UBIQUITOUS_CONSTANTS.MISSION} 참여자
            </div>
            <div className="text-2xl font-bold text-foreground">{missionStats.total}명</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">
              {UBIQUITOUS_CONSTANTS.MISSION} 완료자
            </div>
            <div className="text-2xl font-bold text-foreground">{missionStats.completed}명</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">
              {UBIQUITOUS_CONSTANTS.MISSION} 완주율
            </div>
            <div className="text-2xl font-bold text-foreground">
              {missionStats.completionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b">
        <div className="flex items-center gap-3">
          <PlayCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">세션 참여자</div>
            <div className="text-2xl font-bold text-foreground">{metadata.totalStarted}명</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">세션 완료자</div>
            <div className="text-2xl font-bold text-foreground">{metadata.totalCompleted}명</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="text-sm text-muted-foreground">세션 완주율</div>
            <div className="text-2xl font-bold text-foreground">
              {metadata.completionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {metadata.actions.map(action => {
          const completionRate = action.entryToResponseRate.toFixed(1);
          const avgTimeText = action.averageCompletionTimeMs
            ? formatMillisecondsToKorean(action.averageCompletionTimeMs)
            : "측정 불가";

          return (
            <div key={action.id} className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground truncate min-w-0">
                  {action.title}
                </h3>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                  {completionRate}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">참여자</div>
                    <div className="text-base font-semibold text-foreground">
                      {action.entryCount}명
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">응답 완료</div>
                    <div className="text-base font-semibold text-foreground">
                      {action.responseCount}명
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">진행중</div>
                    <div className="text-base font-semibold text-foreground">
                      {action.inProgressCount}명
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">평균 소요</div>
                    <div className="text-base font-semibold text-foreground">{avgTimeText}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
