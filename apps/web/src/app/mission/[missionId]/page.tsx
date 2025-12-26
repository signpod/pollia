import { getAuthError } from "@/lib/getAuthError";
import { headers } from "next/headers";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { DevTools } from "./components";

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const authError = await getAuthError();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const appUrlHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
    : "";
  const isDevEnvironment = host === appUrlHost;

  return (
    <>
      {isDevEnvironment && <DevTools missionId={missionId} />}
      <MissionClientWrapper initialError={authError} />
    </>
  );
}
