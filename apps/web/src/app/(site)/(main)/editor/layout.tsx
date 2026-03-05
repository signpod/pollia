import { ModalProvider } from "@repo/ui/components";
import { EditorMissionBootstrapProvider } from "./components/model/EditorMissionBootstrapContext";
import { EditorShell } from "./components/view/EditorShell";
import { EditorMissionTabProvider } from "./missions/[missionId]/components/EditorMissionTabContext";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <EditorMissionBootstrapProvider>
        <EditorMissionTabProvider>
          <EditorShell>{children}</EditorShell>
        </EditorMissionTabProvider>
      </EditorMissionBootstrapProvider>
    </ModalProvider>
  );
}
