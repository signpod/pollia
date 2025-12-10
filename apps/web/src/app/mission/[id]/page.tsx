import { getAuthError } from "@/lib/getAuthError";
import { MissionClientWrapper } from "./MissionClientWrapper";

export default async function MissionPage() {
  const authError = await getAuthError();
  console.log(authError)
  return <MissionClientWrapper initialError={authError} />;
}
