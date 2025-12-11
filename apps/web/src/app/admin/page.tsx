import { MissionList } from "./components/MissionList";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">미션</h1>
        <p className="text-muted-foreground">내가 만든 미션 목록입니다.</p>
      </div>
      <MissionList />
    </div>
  );
}
