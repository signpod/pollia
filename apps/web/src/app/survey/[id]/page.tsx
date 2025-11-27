import { getAuthError } from "@/lib/getAuthError";
import { SurveyClientWrapper } from "./SurveyClientWrapper";

export default async function SurveyPage() {
  const authError = await getAuthError();

  return <SurveyClientWrapper initialError={authError} />;
}
