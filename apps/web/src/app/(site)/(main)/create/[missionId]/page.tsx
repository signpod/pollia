import { ActionsSection } from "./components/ActionsSection";
import { CompletionsSection } from "./components/CompletionsSection";
import { MissionInfoSection } from "./components/MissionInfoSection";

export default function CreateMissionEditorPage() {
  return (
    <div className="flex flex-col gap-10 py-10">
      <MissionInfoSection />
      <div className="h-1 w-full bg-zinc-100" />
      <ActionsSection />
      <div className="h-1 w-full bg-zinc-100" />
      <CompletionsSection />
    </div>
  );
}
