import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { EventList } from "../components/EventList";
import { MissionList } from "../components/MissionList";
import { Separator } from "../components/shadcn-ui/separator";

export default function AdminPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UBIQUITOUS_CONSTANTS.EVENT}</h1>
          <p className="text-muted-foreground">
            진행 중인 {UBIQUITOUS_CONSTANTS.EVENT}을 관리합니다.
          </p>
        </div>
        <EventList />
      </section>

      <Separator className="my-8" />

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UBIQUITOUS_CONSTANTS.MISSION}</h1>
          <p className="text-muted-foreground">모든 {UBIQUITOUS_CONSTANTS.MISSION} 목록입니다.</p>
        </div>
        <MissionList />
      </section>
    </div>
  );
}
