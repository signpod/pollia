import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";

interface MissionActionListProps {
  missionId: string;
}

export function MissionActionList({ missionId }: MissionActionListProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>액션 목록</CardTitle>
          <CardDescription>미션에 포함된 트래킹 액션</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            액션 목록이 여기에 표시됩니다. (missionId: {missionId})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

