import type { MissionFunnelData } from "@/types/dto";
import { CheckCircle2, ChevronRight, Clock, PlayCircle, UserCheck, Users } from "lucide-react";

interface MissionFunnelTextViewProps {
  metadata: MissionFunnelData["metadata"];
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${seconds}초`;
  }
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${remainingSeconds}초`;
}

function StatRow({
  icon: Icon,
  label,
  value,
  subValue,
  iconColor,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  subValue?: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
      <div className={`flex shrink-0 ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
        {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
      </div>
    </div>
  );
}

export function MissionFunnelTextView({ metadata }: MissionFunnelTextViewProps) {
  if (!metadata) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center">
        <p className="text-muted-foreground">유효하지 않은 데이터입니다</p>
      </div>
    );
  }

  if (metadata.totalStarted === 0) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center">
        <p className="text-muted-foreground">아직 참여한 사용자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <StatRow
        icon={PlayCircle}
        label="미션 참여자"
        value={`${metadata.totalStarted}명`}
        iconColor="text-teal-600 dark:text-teal-400"
      />

      {metadata.actions.map((action, index) => {
        const completionRate = action.entryToResponseRate.toFixed(1);
        const avgTimeText = action.averageCompletionTimeMs
          ? formatTime(action.averageCompletionTimeMs)
          : "측정 불가";

        return (
          <div key={action.id} className="relative">
            {index > 0 && (
              <div className="flex justify-center py-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
            )}
            <div className="space-y-2 p-4 border rounded-lg bg-card/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  액션 {action.order}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950/20">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-xs text-muted-foreground">참여자</div>
                    <div className="text-sm font-semibold text-foreground">
                      {action.entryCount}명
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xs text-muted-foreground">진행중</div>
                    <div className="text-sm font-semibold text-foreground">
                      {action.inProgressCount}명
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-purple-50 dark:bg-purple-950/20">
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-xs text-muted-foreground">평균 소요</div>
                    <div className="text-sm font-semibold text-foreground">{avgTimeText}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground">완료율</span>
                    <span className="text-sm font-medium text-foreground">{completionRate}%</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 dark:bg-purple-400 transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-center py-1">
        <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
      </div>

      <StatRow
        icon={CheckCircle2}
        label="미션 완료자"
        value={`${metadata.totalCompleted}명`}
        subValue={`전체 완주율: ${metadata.completionRate.toFixed(1)}%`}
        iconColor="text-green-600 dark:text-green-400"
      />
    </div>
  );
}
