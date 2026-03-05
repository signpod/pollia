import { redirect } from "next/navigation";

export default function LegacyCreateMissionPage() {
  redirect("/editor/create");
}
