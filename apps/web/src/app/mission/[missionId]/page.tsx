import { getAuthError } from "@/lib/getAuthError";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { DevTools } from "./components";

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const authError = await getAuthError();

  return (
    <>
      <DevTools missionId={missionId} />
      <MissionClientWrapper initialError={authError} />
    </>
  );
}
